

## Tracking de actividad de usuarios + Enter como salto de linea

### Parte 1: Ultima actividad y metricas de interaccion diaria

**Enfoque**: Usar `auth.sessions` (campo `updated_at`) accesible desde la Edge Function con service role para obtener la ultima actividad de cada usuario. Esto es 100% transparente, no requiere ningun cambio en la experiencia del usuario.

Adicionalmente, crear una nueva tabla `user_activity_log` para registrar interacciones diarias de forma transparente (un registro por usuario por dia), lo que permite saber cuantos usuarios interactuan por dia.

#### Tabla nueva: `user_activity_log`

```text
id          uuid PK default gen_random_uuid()
user_id     uuid NOT NULL (references auth.users on delete cascade)
active_date date NOT NULL default CURRENT_DATE
created_at  timestamptz default now()
UNIQUE(user_id, active_date)
```

- RLS: solo INSERT para el propio usuario, SELECT para admins
- Se registra automaticamente desde el frontend al iniciar sesion (un upsert por dia, sin afectar rendimiento)

#### Cambios en la Edge Function `admin-users-list`

- Obtener `last_sign_in_at` de los auth users (ya disponible en `authUsers.users`)
- Consultar `auth.sessions` para obtener la sesion mas reciente (`updated_at`) por usuario
- Agregar campo `lastActivity` al response (el mas reciente entre `last_sign_in_at` y session `updated_at`)

#### Cambios en el frontend `UsersManager.tsx`

- Agregar columna "Ultima actividad" a la tabla con la fecha formateada
- Hacerla sortable como las demas columnas

#### Grafico de actividad diaria

- Agregar un segundo grafico (similar al de registros) que muestre "Usuarios activos por dia" basado en `user_activity_log`
- La Edge Function devolvera tambien los datos de actividad diaria de los ultimos 30 dias

#### Registro transparente de actividad

- En `src/hooks/useAuth.ts` o en el `App.tsx`, al detectar sesion activa, hacer un upsert silencioso a `user_activity_log` con la fecha actual
- Usar `ON CONFLICT (user_id, active_date) DO NOTHING` para que sea una operacion de 1 vez por dia sin impacto

### Parte 2: Enter como salto de linea en el chat

**Archivo**: `src/components/feedback/ChatInput.tsx`

Actualmente la linea 81 tiene:
```text
if (e.key === 'Enter' && !e.shiftKey) {
  e.preventDefault();
  handleSubmit(e);
}
```

Cambio: eliminar completamente el handler `handleKeyDown` y quitar la prop `onKeyDown` del textarea. Enter sera salto de linea naturalmente. El mensaje solo se enviara con el boton de enviar.

---

### Detalle tecnico - Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migration SQL | Crear tabla `user_activity_log` con RLS |
| `supabase/functions/admin-users-list/index.ts` | Agregar `lastActivity` desde auth users + sessions, agregar query de actividad diaria |
| `src/components/admin/UsersManager.tsx` | Nueva columna "Ultima actividad", nuevo tipo con `lastActivity` |
| `src/components/admin/RegistrationTrendChart.tsx` | Hacerlo reutilizable o crear `ActivityTrendChart` |
| `src/hooks/useAuth.ts` | Agregar upsert silencioso a `user_activity_log` |
| `src/components/feedback/ChatInput.tsx` | Eliminar `handleKeyDown`, enter = salto de linea |
| `src/i18n/en/admin.json` y `src/i18n/es/admin.json` | Nuevas claves de traduccion |

