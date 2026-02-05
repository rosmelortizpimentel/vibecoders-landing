

## Plan: Flujo de Verificación de Propiedad de Dominio

### Objetivo

Implementar un sistema que permita a los usuarios verificar que son propietarios de sus apps/startups mediante la inserción de una etiqueta meta en su sitio web.

**Regla clave de seguridad:** Si el usuario cambia la URL de la app, la verificación se pierde y se genera un nuevo token. Cualquier cambio de URL requiere re-verificación.

---

### Arquitectura del Flujo

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE VERIFICACIÓN                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Usuario ve badge "Sin Verificar" en su App Card                        │
│                           ↓                                                 │
│  2. Click abre Modal con instrucciones + meta tag único                    │
│                           ↓                                                 │
│  3. Usuario copia: <meta name="vibecoders-verify" content="abc123"/>       │
│                           ↓                                                 │
│  4. Lo pega en su sitio y despliega                                        │
│                           ↓                                                 │
│  5. Click "Verificar ahora" → Edge Function hace fetch al sitio            │
│                           ↓                                                 │
│  6a. ÉXITO: Badge cambia a "Verificado" (azul + check)                     │
│  6b. ERROR: Mensaje rojo con instrucciones de retry                        │
│                                                                             │
│  ⚠️  Si cambia la URL → Reset automático + nuevo token                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Sección Técnica

#### 1. Cambios en Base de Datos

**Migración SQL - Nuevas columnas en `apps`:**

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `is_verified` | boolean | false | Estado de verificación |
| `verification_token` | text | auto-generado | Token único para el meta tag |
| `verified_at` | timestamp | null | Fecha de verificación exitosa |
| `verified_url` | text | null | URL que fue verificada (para detectar cambios) |

```sql
ALTER TABLE apps 
ADD COLUMN is_verified boolean NOT NULL DEFAULT false,
ADD COLUMN verification_token text DEFAULT encode(gen_random_bytes(16), 'hex'),
ADD COLUMN verified_at timestamp with time zone,
ADD COLUMN verified_url text;
```

**Trigger de Reset:** Crear un trigger que detecte cambios en `url` y resetee la verificación automáticamente.

```sql
CREATE OR REPLACE FUNCTION reset_app_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la URL cambió, resetear verificación y generar nuevo token
  IF OLD.url IS DISTINCT FROM NEW.url THEN
    NEW.is_verified := false;
    NEW.verified_at := NULL;
    NEW.verified_url := NULL;
    NEW.verification_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reset_app_verification
BEFORE UPDATE ON apps
FOR EACH ROW
EXECUTE FUNCTION reset_app_verification();
```

---

#### 2. Nueva Edge Function: `verify-app-domain`

**Endpoint:** `POST /functions/v1/verify-app-domain`

**Lógica:**
1. Recibe `app_id` del body
2. Valida que el usuario autenticado sea dueño de la app
3. Obtiene la URL y el `verification_token` de la app
4. Hace fetch al sitio web (con timeout de 10s)
5. Parsea el HTML buscando: `<meta name="vibecoders-verify" content="TOKEN"/>`
6. Si el token coincide:
   - Actualiza `is_verified = true`, `verified_at = now()`, y `verified_url = url`
   - Retorna `{ success: true }`
7. Si no coincide o no existe:
   - Retorna `{ success: false, error: "meta_not_found" }`

**Manejo de errores:**
- Timeout → "El sitio no responde"
- CORS/fetch error → "No pudimos acceder al sitio"
- Token no encontrado → "Etiqueta meta no encontrada"
- Token incorrecto → "El token no coincide"

---

#### 3. Actualización del Hook `useApps`

**Cambios en `AppData` interface:**
```typescript
export interface AppData {
  // ... campos existentes ...
  is_verified: boolean;
  verification_token: string;
  verified_at: string | null;
  verified_url: string | null;
}
```

**Nueva función:**
```typescript
const verifyApp = async (appId: string) => {
  const response = await supabase.functions.invoke('verify-app-domain', {
    body: { app_id: appId }
  });
  
  if (response.data?.success) {
    // Refetch para obtener el estado actualizado del servidor
    await fetchApps();
  }
  return response.data;
};
```

**Nota importante sobre el reset:** Como el trigger de la base de datos maneja el reset automáticamente cuando se cambia la URL, el frontend no necesita lógica especial. Al hacer `updateApp` con una nueva URL, el trigger se encarga de:
- Poner `is_verified = false`
- Generar nuevo `verification_token`
- Limpiar `verified_at` y `verified_url`

---

#### 4. Nuevo Componente: `VerificationBadge`

**Ubicación:** `src/components/me/VerificationBadge.tsx`

**Estados visuales:**

| Estado | Color | Icono | Texto |
|--------|-------|-------|-------|
| Sin verificar | Gris (`bg-gray-100 text-gray-500`) | `ShieldQuestion` | "Sin Verificar" |
| Verificado | Azul (`bg-blue-50 text-blue-700`) | `ShieldCheck` | "Verificado" |

**Props:**
```typescript
interface VerificationBadgeProps {
  isVerified: boolean;
  onClick?: () => void;  // Solo activo si no está verificado
}
```

---

#### 5. Nuevo Componente: `VerifyDomainModal`

**Ubicación:** `src/components/me/VerifyDomainModal.tsx`

**Estructura del Modal:**

```text
┌──────────────────────────────────────────────────────────────┐
│  [X]                                                         │
│                                                              │
│  🛡️  Verifica que [AppName] es tuya                         │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Añade la siguiente etiqueta meta en la sección <head>      │
│  de tu página de inicio:                                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ <meta name="vibecoders-verify" content="abc12..." />   │ │
│  │                                              [📋 Copiar]│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Verificaremos: https://mi-app.com                          │
│                                                              │
│               ┌────────────────────────────────────────────┐│
│               │          🔍 Verificar ahora                ││
│               └────────────────────────────────────────────┘│
│                                                              │
│  [Estado de error si aplica]                                 │
│  ❌ No encontramos la etiqueta en mi-app.com.               │
│     Asegúrate de haber desplegado los cambios.              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Estados:**
- `idle`: Mostrando instrucciones
- `verifying`: Spinner + "Buscando etiqueta..."
- `success`: Cierra modal + toast de éxito
- `error`: Mensaje rojo con el error específico

---

#### 6. Integración en `AppCard.tsx`

Añadir el badge de verificación junto a los otros badges:

```tsx
{/* Tags Row */}
<div className="flex items-center gap-2 mt-2">
  {/* Badge de Verificación */}
  <VerificationBadge 
    isVerified={app.is_verified}
    onClick={() => !app.is_verified && setShowVerifyModal(true)}
  />
  
  {/* Badges existentes */}
  {status && StatusIcon && (...)}
  {category && (...)}
</div>
```

---

#### 7. Integración en `AppEditor.tsx`

Añadir sección de verificación en el formulario expandido:

```tsx
{/* Sección de Verificación */}
<div className="pt-4 border-t border-gray-200">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <VerificationBadge isVerified={localApp.is_verified} />
      <span className="text-sm text-gray-600">
        {localApp.is_verified 
          ? `Verificado el ${formatDate(localApp.verified_at)}`
          : 'Verifica la propiedad de este dominio'
        }
      </span>
    </div>
    {!localApp.is_verified && (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowVerifyModal(true)}
      >
        Verificar
      </Button>
    )}
  </div>
</div>
```

---

### Comportamiento del Reset Automático

Cuando el usuario cambia la URL de una app:

```text
┌─────────────────────────────────────────────────────────────────┐
│  ANTES: App verificada                                          │
│  URL: https://mi-app.com ✓                                      │
│  Token: abc123                                                  │
│  verified_url: https://mi-app.com                               │
├─────────────────────────────────────────────────────────────────┤
│  USUARIO CAMBIA URL → https://nueva-url.com                     │
├─────────────────────────────────────────────────────────────────┤
│  DESPUÉS: (trigger automático)                                  │
│  URL: https://nueva-url.com                                     │
│  is_verified: false                                             │
│  Token: xyz789 (NUEVO)                                          │
│  verified_at: NULL                                              │
│  verified_url: NULL                                             │
└─────────────────────────────────────────────────────────────────┘
```

**El usuario DEBE re-verificar aunque vuelva a poner la URL original**, porque:
1. El token ya cambió
2. No guardamos historial de URLs verificadas
3. Esto previene suplantación de identidad

---

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `supabase/functions/verify-app-domain/index.ts` | Edge Function para verificar el meta tag |
| `src/components/me/VerificationBadge.tsx` | Badge visual de estado |
| `src/components/me/VerifyDomainModal.tsx` | Modal con instrucciones y botón verificar |

---

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/hooks/useApps.ts` | Añadir nuevos campos a interface + función `verifyApp` |
| `src/components/me/AppCard.tsx` | Añadir VerificationBadge |
| `src/components/me/AppEditor.tsx` | Añadir sección de verificación con botón |
| `supabase/config.toml` | Registrar nueva edge function |

---

### Migración de Base de Datos

```sql
-- Añadir columnas de verificación a apps
ALTER TABLE apps 
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verified_url text;

-- Generar tokens para apps existentes
UPDATE apps 
SET verification_token = encode(gen_random_bytes(16), 'hex')
WHERE verification_token IS NULL;

-- Asegurar que apps nuevas tengan token
ALTER TABLE apps 
ALTER COLUMN verification_token SET DEFAULT encode(gen_random_bytes(16), 'hex');

-- Función para resetear verificación al cambiar URL
CREATE OR REPLACE FUNCTION reset_app_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.url IS DISTINCT FROM NEW.url THEN
    NEW.is_verified := false;
    NEW.verified_at := NULL;
    NEW.verified_url := NULL;
    NEW.verification_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función
DROP TRIGGER IF EXISTS trigger_reset_app_verification ON apps;
CREATE TRIGGER trigger_reset_app_verification
BEFORE UPDATE ON apps
FOR EACH ROW
EXECUTE FUNCTION reset_app_verification();
```

---

### Consideraciones de Seguridad

1. **Solo el dueño puede verificar:** La Edge Function valida `auth.uid() = app.user_id`
2. **Token único por app:** Cada app tiene su propio token, no reutilizable
3. **Reset automático al cambiar URL:** Previene transferencia de verificación entre dominios
4. **Sin historial de URLs:** Cambiar URL siempre requiere re-verificación
5. **Sin exposición del token en perfil público:** El token solo se muestra en el editor privado

