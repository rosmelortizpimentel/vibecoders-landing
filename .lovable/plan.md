
# Plan: Corregir políticas RLS para tabla waitlist

## Diagnóstico
El link "Build Log" no aparece porque la tabla `waitlist` tiene políticas RLS que **solo permiten acceso al rol `anon`** (usuarios no logueados), pero no al rol `authenticated` (usuarios logueados).

Cuando el usuario está autenticado:
1. El hook `useWaitlistStatus` intenta consultar la tabla `waitlist`
2. Supabase usa el rol `authenticated` 
3. No existe política de SELECT para ese rol
4. La consulta retorna vacío (o error silencioso)
5. `isInWaitlist` queda en `false`
6. El link "Build Log" no se muestra

## Solución
Agregar una política RLS que permita a usuarios autenticados consultar su propio registro en la tabla `waitlist`.

## Cambio a realizar

### Migración SQL
Crear una nueva política RLS que permita a usuarios autenticados leer registros de la tabla waitlist donde el email coincida con su email de autenticación.

```sql
CREATE POLICY "Allow authenticated users to check their own waitlist status"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (email = lower(auth.jwt() ->> 'email'));
```

Esta política:
- Aplica al rol `authenticated` (usuarios logueados)
- Permite operación SELECT
- Solo permite leer filas donde el email de la waitlist coincide con el email del usuario autenticado
- Usa `lower()` para asegurar comparación case-insensitive

## Resultado esperado
Después de aplicar la migración:
1. Usuarios autenticados podrán consultar si su email está en la waitlist
2. El hook `useWaitlistStatus` funcionará correctamente
3. El link "Build Log" aparecerá en el menú para usuarios que estén en la waitlist
