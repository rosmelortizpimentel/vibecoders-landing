
# Plan: Implementar Página /stack con Administración

## Resumen

Crear una nueva sección "The Vibe Stack" que muestre un directorio curado de herramientas tecnológicas recomendadas, con panel de administración para gestión completa (CRUD + drag-and-drop). **Los logos se almacenarán en un bucket separado llamado `stack-assets`.**

---

## Arquitectura General

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /stack (Página Pública)          /admin/stack (Panel Admin)        │
│  ┌─────────────────────────┐      ┌─────────────────────────┐      │
│  │ - Header + Filtros      │      │ - Lista con drag-drop   │      │
│  │ - Grid de ToolCards     │      │ - CRUD completo         │      │
│  │ - Featured destacadas   │      │ - Toggle activo/featured│      │
│  └─────────────────────────┘      └─────────────────────────┘      │
│           │                                │                        │
│           └────────────┬───────────────────┘                        │
│                        │                                            │
│               ┌────────▼────────┐                                   │
│               │   useToolsStack │  (React Query hook)               │
│               └────────┬────────┘                                   │
│                        │                                            │
├────────────────────────┼────────────────────────────────────────────┤
│                        │          SUPABASE                          │
│               ┌────────▼────────┐  ┌─────────────────┐              │
│               │  tools_library  │  │  stack-assets   │              │
│               │     (tabla)     │  │    (bucket)     │              │
│               └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Paso 1: Crear Bucket `stack-assets` en Supabase

### SQL para crear el bucket

```sql
-- Crear bucket público para logos del stack
INSERT INTO storage.buckets (id, name, public)
VALUES ('stack-assets', 'stack-assets', true);

-- Política: Lectura pública
CREATE POLICY "Public read stack assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'stack-assets');

-- Política: Solo admins pueden subir
CREATE POLICY "Admins can upload stack assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stack-assets' 
  AND has_role(auth.uid(), 'admin')
);

-- Política: Solo admins pueden actualizar
CREATE POLICY "Admins can update stack assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stack-assets' 
  AND has_role(auth.uid(), 'admin')
);

-- Política: Solo admins pueden eliminar
CREATE POLICY "Admins can delete stack assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stack-assets' 
  AND has_role(auth.uid(), 'admin')
);
```

---

## Paso 2: Crear Tabla `tools_library`

### Esquema de la tabla

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Identificador único |
| created_at | timestamptz | No | now() | Fecha de creación |
| name | text | No | - | Nombre de la herramienta |
| tagline | text | No | - | Descripción corta (max 60 chars) |
| logo_url | text | Sí | null | URL del icono (en bucket stack-assets) |
| website_url | text | No | - | URL del sitio (puede ser afiliado) |
| category | text | No | - | Categoría (Frontend AI, Backend, etc) |
| pricing_model | text | Sí | null | Modelo de precio (Free Tier, Paid, Open Source) |
| is_featured | boolean | No | false | Destacar herramienta |
| is_active | boolean | No | true | Visible en página pública |
| display_order | numeric | No | 0 | Orden de visualización |

### SQL para crear la tabla y políticas RLS

```sql
CREATE TABLE public.tools_library (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  tagline text NOT NULL,
  logo_url text,
  website_url text NOT NULL,
  category text NOT NULL,
  pricing_model text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order numeric NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.tools_library ENABLE ROW LEVEL SECURITY;

-- Lectura pública de herramientas activas
CREATE POLICY "Public view active tools"
ON public.tools_library FOR SELECT
USING (is_active = true);

-- Admins pueden ver todas (incluyendo inactivas)
CREATE POLICY "Admins view all tools"
ON public.tools_library FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Solo admins pueden insertar
CREATE POLICY "Admins can insert tools"
ON public.tools_library FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Solo admins pueden actualizar
CREATE POLICY "Admins can update tools"
ON public.tools_library FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Solo admins pueden eliminar
CREATE POLICY "Admins can delete tools"
ON public.tools_library FOR DELETE
USING (has_role(auth.uid(), 'admin'));
```

### Datos iniciales

```sql
INSERT INTO public.tools_library (name, tagline, website_url, category, pricing_model, is_featured, display_order) VALUES
  ('Lovable', 'Fullstack AI development', 'https://lovable.dev', 'Frontend AI', 'Free Tier', true, 0),
  ('Supabase', 'Backend as a Service', 'https://supabase.com', 'Backend', 'Free Tier', true, 1),
  ('Vercel', 'Deploy with zero config', 'https://vercel.com', 'Hosting', 'Free Tier', false, 2);
```

---

## Paso 3: Archivos a Crear

### Estructura de archivos nuevos:

```text
src/
├── pages/
│   └── Stack.tsx                    # Página pública /stack
├── hooks/
│   └── useToolsStack.ts             # Hook React Query
├── components/
│   ├── stack/
│   │   ├── ToolCard.tsx             # Tarjeta de herramienta
│   │   └── ToolCardSkeleton.tsx     # Loading skeleton
│   └── admin/
│       ├── StackManager.tsx         # Gestor admin (como ShowcaseManager)
│       └── StackForm.tsx            # Formulario crear/editar
```

---

## Paso 4: Diseño de la Página Pública /stack

### Layout

```text
┌─────────────────────────────────────────────────────────────────┐
│  [Header]  Logo                              [Avatar Menu]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    The Vibe Stack                               │
│      Las herramientas que usamos para construir productos       │
│              escalables a velocidad récord.                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Todos] [Frontend AI] [Backend] [Hosting] [Design]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │  CARD   │ │  CARD   │ │   CARD  │ │   CARD  │               │
│  │ Featured│ │ Featured│ │         │ │         │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Componente ToolCard

Diseño compacto estilo directorio SaaS:

```text
┌──────────────────────────────────────────────┐
│  ┌──────┐                   [Frontend AI]    │  <- Badge categoría
│  │ LOGO │    Lovable                         │
│  │ 40px │    Fullstack AI development        │  <- Tagline (max 2 líneas)
│  └──────┘                                    │
│                              [Free Tier]     │  <- Badge pricing (verde si free)
└──────────────────────────────────────────────┘
   ^ Borde dorado/destacado si is_featured = true
```

### Categorías para filtros

- Todos (default)
- Frontend AI
- Backend
- Database
- Hosting
- Design
- AI/ML

---

## Paso 5: Hook useToolsStack

```typescript
// src/hooks/useToolsStack.ts

export interface Tool {
  id: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  website_url: string;
  category: string;
  pricing_model: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// Ordenar: is_featured primero, luego por display_order
async function fetchTools(): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('tools_library')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true });
  // ...
}
```

---

## Paso 6: Panel de Administración

### Añadir ruta al sidebar (AdminSidebar.tsx)

```typescript
const menuItems = [
  { title: 'Showcases', href: '/admin/showcase', icon: LayoutGrid },
  { title: 'Stack', href: '/admin/stack', icon: Layers }, // NUEVO
];
```

### Añadir ruta en Admin.tsx

```typescript
<Route path="stack" element={<StackManager />} />
```

### StackManager (similar a ShowcaseManager)

Funcionalidades:
- Lista con drag-and-drop para reordenar
- Toggle para is_active y is_featured
- Botones editar/eliminar
- Modal de formulario para crear/editar

### StackForm

El formulario usará el bucket **`stack-assets`** para subir logos:

```typescript
const uploadLogo = async (file: File): Promise<string | null> => {
  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const fileName = `logo_${timestamp}.${ext}`;
  
  const { error } = await supabase.storage
    .from('stack-assets')  // <-- Bucket dedicado
    .upload(fileName, file, { upsert: true });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('stack-assets')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};
```

Campos del formulario:
- Nombre de la herramienta (required)
- Tagline (required)
- Website URL (required)
- Logo (file upload al bucket **stack-assets**)
- Categoría (select con opciones predefinidas)
- Modelo de precio (select: Free Tier, Paid, Open Source)
- Featured (switch)
- Activo (switch)

---

## Paso 7: Integración de Rutas

Modificar `App.tsx`:

```typescript
import Stack from './pages/Stack';

// En Routes:
<Route path="/stack" element={<Stack />} />
```

---

## Resumen de Archivos

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| Migración SQL | Crear | Tabla tools_library + bucket stack-assets |
| `src/pages/Stack.tsx` | **Crear** | Página pública del directorio |
| `src/hooks/useToolsStack.ts` | **Crear** | Hook para fetching de herramientas |
| `src/components/stack/ToolCard.tsx` | **Crear** | Tarjeta compacta de herramienta |
| `src/components/stack/ToolCardSkeleton.tsx` | **Crear** | Skeleton de carga |
| `src/components/admin/StackManager.tsx` | **Crear** | Gestor admin con drag-drop |
| `src/components/admin/StackForm.tsx` | **Crear** | Formulario modal |
| `src/components/admin/AdminSidebar.tsx` | Modificar | Añadir enlace "Stack" |
| `src/pages/Admin.tsx` | Modificar | Añadir ruta /admin/stack |
| `src/App.tsx` | Modificar | Añadir ruta /stack |

---

## Beneficios

1. **Separación de recursos**: Bucket `stack-assets` dedicado para logos de herramientas
2. **Consistencia**: Reutiliza patrones existentes (ShowcaseManager, RLS con has_role)
3. **Monetización**: URLs pueden incluir links de afiliado
4. **SEO/Branding**: Posiciona a Vibecoders como curador de herramientas
5. **Escalable**: Fácil añadir nuevas herramientas desde el admin

---

## Notas Técnicas

- Nuevo bucket `stack-assets` con políticas RLS restrictivas (solo admin puede subir/modificar)
- Las políticas RLS siguen el mismo patrón que showcase_gallery usando `has_role()`
- El hook seguirá el patrón de `useShowcase` con React Query
- Drag-and-drop usa @dnd-kit ya instalado en el proyecto
- Timestamp en nombres de archivo para evitar problemas de caché
