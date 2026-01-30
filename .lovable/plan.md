
# Plan: Perfiles Publicos Seguros con Edge Function

## Resumen

Implementar paginas de perfil publicas accesibles en `/@username` que muestran solo informacion segura (foto, primer nombre, username) sin exponer emails ni datos sensibles. La seguridad se garantiza mediante una Edge Function que actua como intermediario.

---

## Arquitectura de Seguridad

```text
+-------------------+     +----------------------+     +------------------+
|   Frontend        |     |   Edge Function      |     |   Supabase       |
|   /@username      | --> |   get-public-profile | --> |   auth.users     |
|                   |     |   (service_role)     |     |   + profiles     |
+-------------------+     +----------------------+     +------------------+
        |                         |
        |   Solo recibe:          |   Tiene acceso a:
        |   - avatar_url          |   - user_metadata
        |   - first_name          |   - email (NO se envia)
        |   - username            |   - todos los datos
        +-------------------------+
```

El frontend NUNCA tiene acceso directo a `auth.users`. Solo la Edge Function con `service_role` puede leer esos datos y filtra lo que envia al cliente.

---

## Cambios Necesarios

### 1. Nueva Edge Function: `get-public-profile`

**Archivo**: `supabase/functions/get-public-profile/index.ts`

Responsabilidades:
- Recibir `username` como parametro
- Buscar el perfil en la tabla `profiles`
- Si existe, obtener datos de `auth.users` usando `service_role`
- Extraer solo `avatar_url` y `full_name` del `user_metadata`
- Limitar `full_name` al primer nombre
- Devolver respuesta segura (sin email ni otros datos sensibles)

```typescript
// Estructura de respuesta exitosa
{
  "success": true,
  "profile": {
    "username": "founder",
    "avatar_url": "https://...",
    "first_name": "Carlos"
  }
}

// Estructura de respuesta si no existe
{
  "success": false,
  "error": "Profile not found"
}
```

### 2. Actualizar `supabase/config.toml`

Agregar configuracion para la nueva funcion:

```toml
project_id = "zkotnnmrehzqonlyeorv"

[functions.get-public-profile]
verify_jwt = false
```

### 3. Nueva Pagina: `PublicProfile.tsx`

**Archivo**: `src/pages/PublicProfile.tsx`

- Extraer `username` de la URL usando `useParams`
- Llamar a la Edge Function para obtener datos
- Mostrar tarjeta de perfil de solo lectura
- Si no existe el perfil, redirigir a landing

Diseno de la tarjeta (basado en la imagen de referencia):
- Fondo azul #3D5AFE
- Avatar centrado con borde
- Solo primer nombre (grande, blanco)
- @username debajo
- Badge "Vibecoder" con icono de estrella

### 4. Nuevo Componente: `PublicProfileCard.tsx`

**Archivo**: `src/components/PublicProfileCard.tsx`

Componente de solo lectura que muestra:
- Avatar del usuario
- Primer nombre solamente
- @username
- Badge de Vibecoder
- NO muestra email, botones de edicion, ni informacion sensible

### 5. Actualizar Rutas en `App.tsx`

Agregar ruta dinamica para perfiles publicos:

```tsx
<Route path="/@:username" element={<PublicProfile />} />
```

Esta ruta debe ir ANTES del catch-all `*`.

### 6. Nuevo Hook: `usePublicProfile.ts`

**Archivo**: `src/hooks/usePublicProfile.ts`

Hook para obtener perfiles publicos:
- Llama a la Edge Function `get-public-profile`
- Maneja estados de loading, error y datos
- Retorna datos seguros del perfil

---

## Flujo de Usuario

```text
1. Visitante accede a vibecoders.la/@founder
   |
   v
2. React Router captura la ruta /@:username
   |
   v
3. PublicProfile.tsx extrae "founder" como username
   |
   v
4. usePublicProfile llama a Edge Function
   |
   v
5. Edge Function busca en profiles por username
   |
   +-- Si NO existe --> { success: false }
   |                         |
   |                         v
   |                    Redirigir a landing
   |
   +-- Si existe --> Buscar en auth.users con service_role
                         |
                         v
                    Extraer avatar_url y full_name
                         |
                         v
                    Retornar solo datos seguros
                         |
                         v
                    Mostrar PublicProfileCard
```

---

## Archivos a Crear/Modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `supabase/functions/get-public-profile/index.ts` | Crear | Edge Function segura |
| `supabase/config.toml` | Modificar | Agregar config de la funcion |
| `src/pages/PublicProfile.tsx` | Crear | Pagina de perfil publico |
| `src/components/PublicProfileCard.tsx` | Crear | Tarjeta de solo lectura |
| `src/hooks/usePublicProfile.ts` | Crear | Hook para obtener perfil |
| `src/App.tsx` | Modificar | Agregar ruta /@:username |

---

## Seccion Tecnica: Detalle de la Edge Function

```typescript
// Pseudocodigo de get-public-profile/index.ts

import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Obtener username de la query string
  const url = new URL(req.url)
  const username = url.searchParams.get('username')

  // Validar input
  if (!username || !/^[a-zA-Z0-9_]{1,20}$/.test(username)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid username' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Crear cliente con service_role (acceso completo)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Buscar perfil por username
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, username')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (profileError || !profile) {
    return new Response(
      JSON.stringify({ success: false, error: 'Profile not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // 2. Obtener datos de auth.users (solo con service_role)
  const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id)

  if (userError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: 'User not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // 3. Extraer solo datos seguros
  const fullName = user.user_metadata?.full_name || ''
  const firstName = fullName.split(' ')[0] || 'Vibecoder'
  const avatarUrl = user.user_metadata?.avatar_url || null

  // 4. Retornar respuesta segura (SIN email)
  return new Response(
    JSON.stringify({
      success: true,
      profile: {
        username: profile.username,
        avatar_url: avatarUrl,
        first_name: firstName
      }
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
```

---

## Consideraciones de Seguridad

1. **Email nunca expuesto**: La Edge Function es el unico punto que accede a `auth.users` y NUNCA incluye email en la respuesta

2. **Validacion de input**: El username se valida con regex antes de cualquier consulta a la base de datos

3. **Service Role solo en backend**: La clave `SUPABASE_SERVICE_ROLE_KEY` solo existe en el entorno de Edge Functions, nunca en el frontend

4. **RLS no aplica a Edge Functions con service_role**: Esto es intencional y seguro porque la funcion filtra manualmente los datos

5. **Primer nombre solamente**: Para mayor privacidad, solo se muestra el primer nombre, no el nombre completo

---

## Diseno Visual de PublicProfileCard

```text
+------------------------------------------+
|                                          |
|              [Avatar]                    |
|                                          |
|             Carlos                       |
|            @founder                      |
|                                          |
|     +------------------------------+     |
|     |  [*] Vibecoder               |     |
|     +------------------------------+     |
|                                          |
+------------------------------------------+

Colores:
- Fondo: #3D5AFE
- Texto nombre: blanco
- Texto username: blanco/70
- Badge: fondo blanco/10, texto blanco
```
