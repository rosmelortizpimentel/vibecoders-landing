
## Diagnóstico (por qué pasa hoy)

### 1) La “validación de disponibilidad” está mal por RLS
La tabla `profiles` tiene RLS que permite **SELECT solo del propio perfil**:
- “Users can view own profile” (SELECT usando `auth.uid() = id`)

Eso significa que desde el frontend (con la sesión del usuario) **NO puedes leer filas de otros usuarios** para saber si un `username` ya existe. Por eso:
- `checkUsernameAvailable()` siempre “cree” que está disponible (no ve a otros usuarios)
- El UI muestra el check (azul)
- Al guardar, Postgres sí aplica la constraint única y falla con:
  `23505 duplicate key value violates unique constraint "profiles_username_key"`

### 2) El mensaje de error es genérico
`updateUsername()` en `useProfile.ts` cae en el catch y devuelve “Error al guardar” porque no está mapeando el código `23505` a un mensaje amigable.

### 3) “Consulta a cada rato / bucle”
Aunque el debounce existe, si la función de validación o sus dependencias cambian, el `useEffect` puede re-programar timers y parecer un “bucle”.
Además, aunque lo arreglemos, mientras la validación sea contra `profiles` desde el cliente (bloqueada por RLS), seguirá “pasando” y luego “fallando” al guardar, dando la sensación de inconsistencia constante.

---

## Objetivo
- Validación de disponibilidad **correcta** (realmente detecta si el username ya existe).
- El check azul solo aparece cuando de verdad está disponible.
- Si se intenta guardar y el username ya está tomado, mostrar: **“Username no disponible”** (no “Error al guardar”).
- Mantener emails seguros: **no exponer correos al frontend**.

---

## Solución propuesta (100% segura para emails)
Crear una **Edge Function** exclusiva para disponibilidad de usernames (sin devolver PII):
- Usa `SUPABASE_SERVICE_ROLE_KEY` para poder consultar `profiles` sin RLS
- Devuelve únicamente: `{ available: boolean }`
- Requiere JWT (solo usuarios logueados) para evitar scraping público

Luego:
- `checkUsernameAvailable()` en el frontend llama a esa Edge Function
- `updateUsername()` mapea `23505` → “Username no disponible”
- El debounce queda estable y sin loops

---

## Cambios concretos

### A) Backend: nueva Edge Function `check-username-available`
**Archivo nuevo**: `supabase/functions/check-username-available/index.ts`

**Comportamiento:**
- Input: `username` (en body JSON)
- Validación server-side: regex `^[a-zA-Z0-9_]{1,20}$` + normalizar a lowercase
- Query (service role): buscar en `profiles` por `username = lower(username)`
- Respuesta:
  - 200: `{ success: true, available: true/false }`
  - 400: `{ success: false, error: 'Invalid username' }`
  - 500: `{ success: false, error: 'Database error' }`

**Seguridad:**
- No retorna emails ni IDs de otros usuarios
- Solo devuelve un boolean

### B) Config: exigir JWT en la Edge Function
**Editar**: `supabase/config.toml`

Agregar:
```toml
[functions.check-username-available]
verify_jwt = true
```

Esto hace que solo usuarios autenticados puedan consultar disponibilidad.

---

### C) Frontend: `useProfile.ts`
**Editar**: `src/hooks/useProfile.ts`

1) Reemplazar `checkUsernameAvailable`:
- Dejar de consultar `profiles` directo (eso falla por RLS)
- Usar `supabase.functions.invoke('check-username-available', { body: { username } })`
- Normalizar `username` a lowercase antes de enviarlo
- Manejar errores: si la function falla, retornar `false` o manejarlo como “no disponible” (para no permitir guardar a ciegas)

2) Arreglar `updateUsername` para mensaje correcto:
- Eliminar el “pre-check” contra `profiles` (también está roto por RLS)
- Hacer el update directamente
- Si falla con `code === '23505'`, devolver:
  - `error: 'Username no disponible'`
- Mantener mensajes existentes para formato inválido
- (Opcional) Siempre normalizar `username = username.trim().toLowerCase()` dentro de `updateUsername` para blindaje

**Resultado esperado**: aunque ocurra una carrera (raro), el backend siempre impedirá duplicados y el usuario verá el mensaje correcto.

---

### D) UI: `ProfileCard.tsx`
**Editar**: `src/components/ProfileCard.tsx`

1) Mensajería:
- Donde hoy dice: `Este username ya está en uso`
- Cambiar a: **`Username no disponible`**
- Donde hoy cae en `result.error || 'Error al guardar'`, queremos que casi siempre venga ya:
  - `result.error === 'Username no disponible'` cuando sea duplicado

2) Evitar “bucle” en el debounce:
- Asegurar que el efecto de debounce no se re-dispare por referencias cambiantes.
- Implementación robusta:
  - Mantener un `useRef` a `checkUsernameAvailable` para no depender de la identidad de la función en el `useEffect`.
  - En el callback async usar un flag `active` para evitar setState cuando el efecto ya se limpió (usuario siguió escribiendo o cambió de pantalla).

3) Consistencia visual:
- Confirmar check en azul (ya está en `text-[#3D5AFE]`)
- Si el guardado devuelve “Username no disponible”, setear `setIsAvailable(false)` para que cambie a la X roja y se deshabilite Guardar.

---

## Archivos a tocar

1) **Crear**
- `supabase/functions/check-username-available/index.ts`

2) **Editar**
- `supabase/config.toml`
- `src/hooks/useProfile.ts`
- `src/components/ProfileCard.tsx`

---

## Criterios de aceptación (cómo probamos que quedó bien)

1) Username existente:
- Escribir `rosmelortiz`
- Esperar ~2s sin teclear
- Debe aparecer **X roja** y texto **“Username no disponible”**
- Botón Guardar debe quedar deshabilitado

2) Username nuevo:
- Escribir uno que no exista
- Esperar ~2s sin teclear
- Debe aparecer **check azul**
- Guardar debe funcionar sin error

3) Caso de carrera / duplicado:
- Si por cualquier razón el update devuelve `23505`, debe mostrarse:
  - **“Username no disponible”**
  - No “Error al guardar”
  - Y el UI debe reflejarlo con X roja

4) “No bucle”:
- Al dejar de escribir, debe consultarse **una vez**
- Si vuelves a escribir, se cancela el timer anterior y se programa uno nuevo
- No debe hacer requests “cada rato” con el mismo username sin cambios

---

## Nota importante de seguridad
Esta solución mantiene el backend seguro:
- El frontend nunca recibe emails (ni los consulta)
- La Edge Function solo devuelve un boolean (no PII)
- `verify_jwt=true` reduce enumeración pública de usernames (solo usuarios logueados)