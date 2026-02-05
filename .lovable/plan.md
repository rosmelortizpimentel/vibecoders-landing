
## Resumen

Implementar un sistema de URLs de referido para las tablas `tech_stacks` y `tools_library`, que permita:
1. **URLs base y de referido** a nivel de administrador para cada herramienta/tecnología
2. **Códigos de referido personalizados por usuario** solo para `tech_stacks` (las tecnologías que seleccionan en sus apps)
3. **Nuevo mantenimiento de Tech Stacks** en el panel de administración

---

## Arquitectura del Sistema

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TABLAS DE REFERENCIA                               │
├──────────────────────────────────┬──────────────────────────────────────────┤
│         tech_stacks              │           tools_library                  │
│  (Combo de apps - TechStack-     │   (Página /tools - Vibe Stack)           │
│   Selector)                      │                                          │
├──────────────────────────────────┼──────────────────────────────────────────┤
│ + website_url      (base URL)    │ website_url    (ya existe)               │
│ + referral_url     (template)    │ + referral_url (nuevo campo)             │
│ + referral_param   (param name)  │ + referral_param (nuevo campo)           │
│ + default_referral_code          │ + default_referral_code (plataforma)     │
└──────────────────────────────────┴──────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TABLA DE REFERIDOS POR USUARIO                            │
│                         user_stack_referrals                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  id                 UUID (PK)                                               │
│  user_id            UUID (FK → auth.users)                                  │
│  stack_id           UUID (FK → tech_stacks)                                 │
│  referral_code      TEXT (código personalizado del usuario)                 │
│  created_at         TIMESTAMP                                               │
│  updated_at         TIMESTAMP                                               │
│                                                                             │
│  UNIQUE(user_id, stack_id)                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Ejemplos de URLs

| Herramienta | Base URL | Referral Template | Referral Param | Default Code | URL Final |
|-------------|----------|-------------------|----------------|--------------|-----------|
| Lovable | https://lovable.dev | https://lovable.dev/invite/{code} | code | KFET6W5 | https://lovable.dev/invite/KFET6W5 |
| Windsurf | https://windsurf.com | https://windsurf.com/refer?referral_code={code} | referral_code | pad9p1vab0accfsv | https://windsurf.com/refer?referral_code=pad9p1vab0accfsv |
| Supabase | https://supabase.com | (null) | (null) | (null) | https://supabase.com |

**Lógica de construcción de URL:**
1. Si `referral_url` existe y hay un código (default o de usuario) → usar `referral_url.replace('{code}', codigo)`
2. Si no hay `referral_url` pero hay `referral_param` → usar `website_url?{param}={code}`
3. Si no hay ninguno → usar `website_url` directamente

---

## Cambios en Base de Datos

### 1. Nuevos campos en `tech_stacks`

```sql
ALTER TABLE tech_stacks
  ADD COLUMN website_url TEXT,
  ADD COLUMN referral_url TEXT,
  ADD COLUMN referral_param TEXT,
  ADD COLUMN default_referral_code TEXT;
```

### 2. Nuevos campos en `tools_library`

```sql
ALTER TABLE tools_library
  ADD COLUMN referral_url TEXT,
  ADD COLUMN referral_param TEXT,
  ADD COLUMN default_referral_code TEXT;
```

### 3. Nueva tabla `user_stack_referrals`

```sql
CREATE TABLE user_stack_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_id UUID NOT NULL REFERENCES tech_stacks(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stack_id)
);

ALTER TABLE user_stack_referrals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own referral codes"
  ON user_stack_referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral codes"
  ON user_stack_referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes"
  ON user_stack_referrals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own referral codes"
  ON user_stack_referrals FOR DELETE
  USING (auth.uid() = user_id);
```

### 4. Políticas RLS para `tech_stacks` (CRUD para admins)

```sql
CREATE POLICY "Admins can insert tech stacks"
  ON tech_stacks FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tech stacks"
  ON tech_stacks FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tech stacks"
  ON tech_stacks FOR DELETE
  USING (has_role(auth.uid(), 'admin'));
```

---

## Nuevos Componentes de Admin

### 1. TechStackManager

Nuevo componente en `/admin/tech-stacks` para gestionar la tabla `tech_stacks`:

| Archivo | Descripción |
|---------|-------------|
| `src/components/admin/TechStackManager.tsx` | Lista con drag-and-drop, igual que StackManager |
| `src/components/admin/TechStackForm.tsx` | Formulario con campos de URL y referido |

**Campos del formulario:**
- Nombre
- Logo (upload a stack-assets)
- Tags (JSON array para categorías)
- Website URL
- Referral URL (template con {code})
- Referral Param (nombre del parámetro)
- Default Referral Code (código de la plataforma)
- Display Order

### 2. Actualizar StackForm

Agregar los nuevos campos al formulario existente de `tools_library`:
- Referral URL
- Referral Param
- Default Referral Code

---

## Actualización del Sidebar Admin

```typescript
// AdminSidebar.tsx
const menuItems = [
  { title: 'Showcases', href: '/admin/showcase', icon: LayoutGrid },
  { title: 'Stack', href: '/admin/stack', icon: Layers },
  { title: 'Tech Stacks', href: '/admin/tech-stacks', icon: Cpu },  // NUEVO
  { title: 'Usuarios', href: '/admin/users', icon: Users },
  { title: 'Waitlist', href: '/admin/waitlist', icon: Mail },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];
```

---

## Flujo de URL de Referido

### En la página /tools (tools_library)

1. El `ToolCard` usa la URL construida con el código por defecto de la plataforma
2. Lógica en el componente:

```typescript
function buildReferralUrl(tool: Tool): string {
  // Si hay template de referral y código
  if (tool.referral_url && tool.default_referral_code) {
    return tool.referral_url.replace('{code}', tool.default_referral_code);
  }
  // Si hay param y código
  if (tool.referral_param && tool.default_referral_code) {
    const url = new URL(tool.website_url);
    url.searchParams.set(tool.referral_param, tool.default_referral_code);
    return url.toString();
  }
  // Por defecto
  return tool.website_url;
}
```

### En el perfil público (tech_stacks con apps)

1. Cuando se muestra un stack en la tarjeta de app, se busca si el usuario tiene un código personalizado
2. Si tiene código → usar ese código
3. Si no → usar el código por defecto de la plataforma
4. Si no hay ninguno → usar website_url

---

## Actualización de Edge Function

### get-public-profile

Modificar para incluir las URLs de referido construidas:

```typescript
// Al mapear stacks de cada app
const appStacks = (app.app_stacks || [])
  .map((as: { stack_id: string }) => {
    const stack = stacks?.find(s => s.id === as.stack_id);
    if (!stack) return null;
    
    // Buscar código personalizado del usuario
    const userReferral = userReferrals?.find(r => r.stack_id === stack.id);
    const code = userReferral?.referral_code || stack.default_referral_code;
    
    return {
      id: stack.id,
      name: stack.name,
      logo_url: stack.logo_url,
      url: buildReferralUrl(stack, code)  // Nueva función
    };
  })
  .filter(Boolean);
```

---

## Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/admin/TechStackManager.tsx` | Gestor de tech_stacks con lista y drag-and-drop |
| `src/components/admin/TechStackForm.tsx` | Formulario de creación/edición |
| `src/hooks/useUserStackReferrals.ts` | Hook para gestionar códigos de referido del usuario |

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/AdminSidebar.tsx` | Añadir enlace a Tech Stacks |
| `src/pages/Admin.tsx` | Añadir ruta para TechStackManager |
| `src/components/admin/StackForm.tsx` | Añadir campos de referral |
| `src/components/admin/StackManager.tsx` | Actualizar mutaciones para incluir nuevos campos |
| `src/components/stack/ToolCard.tsx` | Usar URL de referido construida |
| `src/hooks/useTechStacks.ts` | Incluir nuevos campos en la query |
| `supabase/functions/get-public-profile/index.ts` | Construir URLs de referido |

---

## Orden de Implementación

1. **Migración de base de datos** - Nuevos campos y tabla
2. **TechStackManager + TechStackForm** - CRUD de tech_stacks desde admin
3. **Actualizar StackForm** - Campos de referral para tools_library
4. **Actualizar ToolCard** - Usar URL de referido en página /tools
5. **Hook useUserStackReferrals** - Gestión de códigos personalizados
6. **Edge function get-public-profile** - URLs de referido en perfiles públicos

---

## Datos Iniciales de Ejemplo

```sql
-- Lovable
UPDATE tech_stacks SET 
  website_url = 'https://lovable.dev',
  referral_url = 'https://lovable.dev/invite/{code}',
  default_referral_code = 'KFET6W5'
WHERE name = 'Lovable';

-- Windsurf (si existe)
UPDATE tech_stacks SET 
  website_url = 'https://windsurf.com',
  referral_url = 'https://windsurf.com/refer',
  referral_param = 'referral_code',
  default_referral_code = 'pad9p1vab0accfsv'
WHERE name = 'Windsurf';
```
