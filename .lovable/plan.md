
## Diagnóstico (qué está pasando y por qué siempre te manda a la landing)

El problema principal NO es Supabase ni la Edge Function (esa URL directa sí responde). El problema es el **router**:

- En `App.tsx` tienes la ruta pública definida como: `"/@:username"`.
- **React Router v6 no soporta parámetros con prefijo dentro del mismo segmento** (ej: `@` pegado al `:username`).
- En la práctica, esa ruta se interpreta como **literal** `"/@:username"` (texto tal cual), así que `"/@founder"` **no matchea**.
- Entonces cae en la ruta `path="*"` y por eso ejecuta `Navigate to="/"` → el navegador termina en la landing (URL base).

Esto coincide perfecto con lo que dijiste: “todo lo que no sea /profile redirecciona al /”, porque tu catch-all `*` lo está haciendo, y `/@founder` hoy está cayendo ahí.

## Objetivo

- Que `/@founder` y `/@rosmelortiz` **sí** entren a la pantalla pública.
- Que **cualquier otra ruta** (no `/profile` y no `/@...`) **siga redirigiendo** a `/`.

## Cambios propuestos (implementación)

### 1) Arreglar la ruta pública en `src/App.tsx`
Reemplazar la ruta inválida:
- Antes: `path="/@:username"`
- Después: `path="/:handle"` (o `path="/:slug"`)

Esto hará que `/@founder` sí haga match, porque React Router sí soporta “un segmento cualquiera” como parámetro.

Importante: mantener `/profile` y `/` como rutas explícitas. React Router prioriza rutas más específicas, así que `/profile` seguirá yendo a Profile.

### 2) Validar que realmente sea un “handle público” dentro de `src/pages/PublicProfile.tsx`
Como `/:handle` puede capturar cualquier cosa (ej: `/pricing`), dentro del componente haremos validación:

- Leer `handle` con `useParams()`. Para `/@founder`, `handle` será `"@founder"`.
- Si `handle` no existe o **no empieza con `@`** → redirigir a `/` (cumple tu regla de “todo lo demás a la landing”).
- Si empieza con `@` → quitar el `@` y usar el username real:
  - `username = handle.slice(1)`

### 3) Llamada a datos (sin cambios grandes)
`usePublicProfile(username)` seguirá igual, solo que ahora recibirá `"founder"` en vez de intentar leer un param que nunca llegaba.

(Nota: tu Edge Function responde correctamente por URL directa, así que una vez que el router deje de bloquear el acceso, debería funcionar.)

## Verificación (pasos concretos de prueba)

1. Abrir la app y visitar:
   - `/@founder` → debe mostrar la tarjeta pública.
   - `/@rosmelortiz` → debe mostrar la tarjeta pública.
2. Probar rutas “no permitidas”:
   - `/cualquier-cosa` → debe redirigir a `/`.
3. En la pestaña Network:
   - Confirmar que aparece el request a:
     - `.../functions/v1/get-public-profile?username=founder`
4. Confirmar que el URL **no cambia** a `/` cuando visitas `/@founder` (salvo que sea inválido).

## Archivos a tocar

- `src/App.tsx`
  - cambiar `"/@:username"` → `"/:handle"`
- `src/pages/PublicProfile.tsx`
  - usar `handle` param, validar prefijo `@`, extraer username real, redirigir si no aplica

## Consideración adicional (por si en Vercel también hay reglas)
Si en tu Vercel (dashboard) tienes un **Redirect** global tipo `/(.*) -> /`, eso sí convertiría todo en landing a nivel servidor (y ni siquiera cargaría el route). En ese caso, hay que quitar ese Redirect y dejarlo como Rewrite SPA (o manejarlo solo en React Router como ya haces).
