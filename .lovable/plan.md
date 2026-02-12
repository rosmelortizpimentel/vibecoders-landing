

## Cambios solicitados

### 1. Redireccion post-login: hacia /me/profile (no /home)

Actualmente, cuando un usuario nuevo inicia sesion, el flujo en `useAuth.ts` lo redirige a `/home`. Se cambiara para que siempre vaya a `/me/profile` despues del login (cuando no hay `authReturnUrl` ni necesita seleccionar plan).

**Archivo:** `src/hooks/useAuth.ts`
- Cambiar la linea `window.location.href = '/home'` a `window.location.href = '/me/profile'`

### 2. Founder Welcome como popup (Dialog), no banner

Actualmente `FounderWelcome` es un banner inline en el dashboard. Se convertira en un Dialog/popup que aparece automaticamente.

**Archivo:** `src/components/home/FounderWelcome.tsx`
- Reescribir como un `Dialog` (popup centrado) usando el componente existente de Radix
- Mostrar numero de fundador, mensaje de felicitacion
- Boton para cerrar

### 3. Persistir "ya visto" en base de datos (no localStorage)

Actualmente usa `localStorage` para recordar que se cerro. Se cambiara a una columna en `user_subscriptions`.

**Migracion SQL:**
- Agregar columna `founder_welcome_seen` (boolean, default false) a `user_subscriptions`

**Archivo:** `src/components/home/FounderWelcome.tsx`
- Al cerrar el popup, hacer UPDATE en `user_subscriptions` poniendo `founder_welcome_seen = true`
- Al montar, verificar si ya lo vio consultando esa columna

**Archivo:** `src/hooks/useSubscription.ts`
- Incluir `founder_welcome_seen` en la query de suscripcion
- Exponer `founderWelcomeSeen` en el return

**Archivo:** `src/pages/Home.tsx`
- Pasar `founderWelcomeSeen` al componente y solo mostrar el popup si es `false`

### 4. Sumar 20 a todos los founder_number en la base de datos

Para mantener consistencia con el contador de la landing (`profileCount + 20`), los founder numbers deben arrancar en 21.

**Migracion SQL:**
```sql
-- Sumar 20 a todos los founder_number existentes
UPDATE user_subscriptions 
SET founder_number = founder_number + 20 
WHERE founder_number IS NOT NULL;
```

**Archivo:** `supabase/functions/get-landing-stats/index.ts`
- Eliminar el `+ 20` del `baseOccupancy` ya que ahora los numeros en DB ya incluyen el offset
- Usar directamente el MAX de `founder_number` o el conteo real de founders para el contador de builders

**Funcion SQL `assign_founder_tier`:**
- Actualizar para que el siguiente founder number sea `MAX(founder_number) + 1` en vez de `COUNT(*) + 1`, ya que ahora los numeros no son secuenciales desde 1

### Resumen de archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/hooks/useAuth.ts` | Redirigir a `/me/profile` en vez de `/home` |
| `src/components/home/FounderWelcome.tsx` | Convertir a Dialog/popup, persistir en DB |
| `src/hooks/useSubscription.ts` | Agregar `founder_welcome_seen` al query |
| `src/pages/Home.tsx` | Adaptar uso del popup |
| `supabase/functions/get-landing-stats/index.ts` | Quitar `+ 20` del calculo |
| Migracion SQL | Agregar columna + UPDATE founder_numbers + actualizar `assign_founder_tier` |

### Flujo resultante

```text
Usuario nuevo inicia sesion
  -> check-founder-status determina tier
  -> Si es founder: redirige a /me/profile
  -> En /me/profile (o cualquier pagina), el popup aparece
  -> Popup: "Eres Fundador #21!" (primer fundador real)
  -> Usuario cierra popup
  -> Se guarda founder_welcome_seen = true en DB
  -> Nunca mas aparece, ni en otro dispositivo
```
