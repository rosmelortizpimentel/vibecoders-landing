

# Plan: Sistema de Waitlist con Login de Google

## Resumen
Crear un sistema completo de waitlist que capture datos del visitante, muestre un mensaje amable invitando a reservar el nombre con Google, y una página de perfil para usuarios autenticados.

## Flujo de Usuario

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE REGISTRO                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Usuario ingresa email → ¿Ya registrado?                               │
│                              │                                          │
│              ┌───────────────┴───────────────┐                         │
│              ▼                               ▼                          │
│         [NO]                              [SÍ]                         │
│              │                               │                          │
│   Guardar en waitlist              Mostrar: "¡Ya estás                 │
│   con todos los datos              en la lista!"                       │
│              │                               │                          │
│              ▼                               ▼                          │
│   Mostrar mensaje:                 Invitar a iniciar                   │
│   "¡Genial! Te avisaremos.         sesión con Google                   │
│   ¿Quieres reservar tu                       │                          │
│   nombre ahora?"                             │                          │
│              │                               │                          │
│              └───────────────┬───────────────┘                         │
│                              ▼                                          │
│                    [Botón: Continuar con Google]                       │
│                              │                                          │
│                              ▼                                          │
│                    Redirigir a /profile                                │
│                    (muestra foto y nombre)                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Cambios Requeridos

### 1. Base de Datos - Tabla `waitlist`

**Migración SQL:**
```sql
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  
  -- Datos del dispositivo/navegador
  user_agent TEXT,
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  
  -- Datos de ubicación (aproximados por timezone/idioma)
  timezone TEXT,
  language TEXT,
  
  -- Datos de pantalla
  screen_width INTEGER,
  screen_height INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- Datos de origen
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Permitir inserción anónima (público)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.waitlist
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous select by email" ON public.waitlist
  FOR SELECT TO anon USING (true);
```

### 2. Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/pages/Profile.tsx` | Página de perfil del usuario autenticado |
| `src/hooks/useAuth.ts` | Hook para manejar autenticación |
| `src/lib/waitlist.ts` | Funciones para insertar/verificar waitlist |
| `src/lib/deviceInfo.ts` | Utilidades para capturar info del dispositivo |
| `src/i18n/es/waitlist.json` | Textos del modal de éxito |

### 3. Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/HeroSection.tsx` | Integrar lógica de waitlist y mostrar modal de éxito |
| `src/App.tsx` | Agregar ruta `/profile` |
| `src/hooks/useTranslation.ts` | Agregar sección `waitlist` |
| `src/i18n/es/hero.json` | Agregar mensajes de ya registrado |

### 4. Detalle de Implementación

#### A. `src/lib/deviceInfo.ts`
Captura información del visitante:
- User Agent parsing (browser, OS, device type)
- Screen dimensions
- Timezone y language
- Referrer y UTM params

#### B. `src/lib/waitlist.ts`
```typescript
// Verificar si email existe
export async function checkEmailExists(email: string): Promise<boolean>

// Registrar en waitlist con todos los datos
export async function registerToWaitlist(email: string): Promise<{
  success: boolean;
  alreadyExists: boolean;
  error?: string;
}>
```

#### C. `src/components/HeroSection.tsx`
Después del submit:
1. Llamar a `registerToWaitlist(email)`
2. Si `alreadyExists`: mostrar mensaje "¡Ya estás en la lista!"
3. Si es nuevo: mostrar mensaje "¡Genial! Te avisaremos..."
4. En ambos casos: mostrar botón "Continuar con Google" para reservar nombre

#### D. `src/hooks/useAuth.ts`
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Login con Google
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/profile` }
    });
  };
  
  // Logout
  const signOut = async () => { ... };
  
  return { user, session, loading, signInWithGoogle, signOut };
}
```

#### E. `src/pages/Profile.tsx`
Página simple que muestra:
- Foto de perfil de Google
- Nombre completo
- Email
- Botón de cerrar sesión

### 5. Textos UI

**Nuevo usuario registrado:**
> "¡Genial! Te avisaremos cuando esté listo. 🎉
> 
> ¿Quieres ir reservando tu nombre de usuario?
> 
> [Continuar con Google]"

**Usuario ya registrado:**
> "¡Ya estás en la lista! 🙌
> 
> ¿Listo para reservar tu nombre de usuario?
> 
> [Continuar con Google]"

## Configuración Requerida por el Usuario

Después de implementar, el usuario necesitará:

1. **Configurar Google OAuth en Supabase:**
   - Ir a Authentication > Providers > Google
   - Agregar Client ID y Client Secret de Google Cloud Console
   - Configurar Authorized redirect URI

2. **Configurar URLs en Supabase:**
   - Site URL: URL de la aplicación
   - Redirect URLs: URL de la aplicación + `/profile`

## Secuencia de Implementación

1. Crear migración de tabla `waitlist`
2. Crear utilidades (`deviceInfo.ts`, `waitlist.ts`)
3. Crear hook `useAuth.ts`
4. Crear página `Profile.tsx`
5. Actualizar traducciones
6. Modificar `HeroSection.tsx` con la nueva lógica
7. Agregar ruta en `App.tsx`

## Datos que se Capturarán

| Campo | Fuente |
|-------|--------|
| email | Input del usuario |
| user_agent | `navigator.userAgent` |
| browser_name | Parsed from UA |
| browser_version | Parsed from UA |
| os_name | Parsed from UA |
| os_version | Parsed from UA |
| device_type | Parsed from UA |
| timezone | `Intl.DateTimeFormat().resolvedOptions().timeZone` |
| language | `navigator.language` |
| screen_width | `screen.width` |
| screen_height | `screen.height` |
| viewport_width | `window.innerWidth` |
| viewport_height | `window.innerHeight` |
| referrer | `document.referrer` |
| utm_* | `URLSearchParams` |

