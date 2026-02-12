## Eliminar usuarios desde el panel de Admin

### Objetivo

Agregar un boton de eliminar usuario en la tabla de `/admin/users` que permita borrar un usuario completo (de `profiles`, `user_subscriptions`, y `auth.users`) para poder re-testear el flujo de registro con un email existente.

### Seguridad

- Solo admins pueden ejecutar esta accion
- Se validara el rol admin en la Edge Function usando `has_role`
- No se permitira eliminar usuarios con rol `admin`
- Se mostrara un dialogo de confirmacion con el nombre/email del usuario

### Cambios necesarios

#### 1. Nueva Edge Function: `admin-delete-user`

Crear `supabase/functions/admin-delete-user/index.ts` que:

- Valide el token JWT y el rol admin del solicitante
- Reciba el `user_id` a eliminar via POST body
- Verifique que el usuario objetivo NO sea admin
- Elimine en orden:
  1. `user_subscriptions` (donde `user_id = target`)
  2. `profiles` (donde `id = target`) -- cascade deberia manejar follows, apps, etc.
  3. `auth.users` via `supabaseAdmin.auth.admin.deleteUser(userId)`
- La eliminacion de `auth.users` con cascade deberia limpiar automaticamente `profiles` (por el FK), pero haremos la limpieza explicita por seguridad

#### 2. Actualizar `UsersManager.tsx`

- Agregar un boton de eliminar (icono Trash2) en cada fila de la tabla
- Mostrar un `AlertDialog` de confirmacion que muestre el nombre y email del usuario
- Deshabilitar el boton para el usuario actual (no auto-eliminarse)
- Al confirmar, llamar a la Edge Function y refrescar la lista
- Mostrar toast de exito/error

#### 3. Enriquecer datos de usuario

- Agregar el campo `tier` y `founder_number` desde `user_subscriptions` en la Edge Function `admin-users-list` para mostrar el tier en la tabla y facilitar la identificacion de founders vs free

### Flujo del usuario

```text
Admin ve tabla de usuarios
  -> Click en icono de eliminar
  -> AlertDialog: "Eliminar a [nombre] ([email])? Esta accion es irreversible."
  -> Confirmar
  -> Edge Function valida admin, elimina datos
  -> Toast de exito, tabla se refresca
  -> Admin puede registrarse con ese email de nuevo
```

### Detalles tecnicos

**Edge Function `admin-delete-user`:**

- Metodo: POST
- Body: `{ userId: string }`
- Usa `SUPABASE_SERVICE_ROLE_KEY` para operaciones admin
- Verifica que el target no tenga rol admin antes de eliminar
- Elimina de `user_subscriptions`, luego usa `auth.admin.deleteUser()` (que cascadea a profiles por el trigger/FK)

**UI:**

- Columna adicional o integracion del boton en la columna "Perfil" existente
- Badge de tier (Founder #X / Free / Pro) visible en la tabla para contexto  
  
  
anade tambien un filtro por plan, y muestra en una columna el plan que tiene actualmente y la fecha de registro y cuantos dias le queda por renovar, si cancelo tambien debo poder ver ese estado.