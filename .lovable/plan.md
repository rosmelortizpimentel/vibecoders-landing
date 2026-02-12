

# Plan: Early Adopter $9.90 con flujo de registro diferenciado

## Resumen

Crear un plan Early Adopter a $9.90/ano en Stripe, diferenciar el flujo de login segun que boton use el usuario (gratis vs pago), y mostrar esa informacion en el panel de admin.

## Paso 1: Crear producto y precio en Stripe

- Crear un nuevo producto "Early Adopter" con precio $9.90/ano (recurring yearly) usando las herramientas de Stripe
- Guardar el price_id en `general_settings` como `stripe_early_adopter_990_price_id`

## Paso 2: Migracion de base de datos

Agregar columna `signup_source` a la tabla `user_subscriptions`:

```sql
ALTER TABLE public.user_subscriptions 
ADD COLUMN signup_source text DEFAULT NULL;
```

Valores posibles: `'free_card'`, `'paid_card'`, `NULL` (usuarios anteriores).

## Paso 3: Modificar el flujo de autenticacion en la landing

### En `NewLanding.tsx` - ClosedAccessSection:

- Los botones del **Card A (Free)** guardan en `localStorage` un flag: `signupSource = 'free_card'` antes de llamar a `signInWithGoogle/LinkedIn`
- Los botones del **Card B ($9.90)** guardan: `signupSource = 'paid_card'` antes de llamar a `signInWithGoogle/LinkedIn`

### En `useAuth.ts` - onAuthStateChange (SIGNED_IN):

Despues de que `check-founder-status` asigna el tier `free`:
1. Leer `localStorage.getItem('signupSource')`
2. Si es `'paid_card'`:
   - Llamar a una nueva edge function `create-checkout-session` con el price_id del Early Adopter ($9.90)
   - Redirigir automaticamente a la URL de Stripe Checkout
3. Si es `'free_card'` o no existe:
   - Flujo normal, redirigir a `/me/profile`
4. Limpiar el flag de localStorage

## Paso 4: Actualizar edge function `check-founder-status`

Modificar para que acepte un parametro opcional `signup_source` y lo guarde en `user_subscriptions.signup_source` al crear/actualizar el registro del usuario.

Alternativa mas simple: crear una edge function pequena `set-signup-source` que actualice el campo, o guardar el source directamente desde el frontend despues del login.

## Paso 5: Modificar `create-checkout-session`

Agregar soporte para recibir un `price_id` opcional en el body de la request. Si se recibe, usar ese price_id en vez del configurado en `general_settings`. Esto permite redirigir al plan de $9.90 desde el flujo de paid_card.

Alternativa: leer el price_id del Early Adopter desde `general_settings` usando una nueva key y pasarlo como parametro desde el frontend.

## Paso 6: Webhook de Stripe (`stripe-webhook`)

El webhook ya maneja `checkout.session.completed` y asigna tier `pro`. No necesita cambios para el Early Adopter ya que se le asigna el mismo tier `pro` con los mismos beneficios. El precio pagado ya se guarda en el campo `price`.

## Paso 7: Guardar signup_source en la base de datos

En `check-founder-status` o en un nuevo endpoint, al registrar al usuario nuevo, guardar el `signup_source` que se pasa desde el frontend (via header, body, o query param).

Enfoque elegido: Modificar `check-founder-status` para leer un parametro `signupSource` del body y guardarlo en `user_subscriptions.signup_source`.

## Paso 8: Mostrar indicador en Admin

### En `admin-users-list` edge function:
- Incluir `signup_source` en el SELECT de `user_subscriptions`
- Pasarlo al frontend como parte del objeto de usuario

### En `UsersManager.tsx`:
- Agregar campo `signup_source` a la interfaz `EnrichedUser`
- Mostrar un badge/indicador junto al tier del usuario:
  - Si `signup_source === 'paid_card'`: badge con icono de tarjeta de credito (ej. "Pago")
  - Si `signup_source === 'free_card'`: badge con texto "Gratis"
  - Si `null`: sin indicador (usuarios anteriores)

## Paso 9: Si el usuario cancela el pago de Stripe

Si el usuario hace clic en los botones del Card B, se loguea, y luego cancela el checkout de Stripe:
- Ya tiene su cuenta creada con tier `free`
- Al volver a la app, tiene sesion activa y acceso normal como usuario free
- No se pierde nada, simplemente no tiene el plan Early Adopter

## Seccion tecnica - Flujo completo

```text
Usuario en Landing
       |
       +-- Clic en Card A (Free) --> localStorage: signupSource='free_card' --> OAuth
       |                                                                        |
       +-- Clic en Card B ($9.90) --> localStorage: signupSource='paid_card' --> OAuth
                                                                                |
                                                                          SIGNED_IN event
                                                                                |
                                                                   check-founder-status
                                                                   (guarda signup_source)
                                                                                |
                                                                       tier = 'free'
                                                                                |
                                                              +--- signupSource?  ---+
                                                              |                      |
                                                         'free_card'            'paid_card'
                                                              |                      |
                                                         /me/profile        create-checkout ($9.90)
                                                                                     |
                                                                              Stripe Checkout
                                                                                     |
                                                                           +----paid?----+
                                                                           |             |
                                                                        webhook      cancel
                                                                        tier=pro     tier=free
                                                                           |             |
                                                                    /payment-success   /me
```

## Archivos a modificar

1. **Migracion SQL** - Agregar columna `signup_source` a `user_subscriptions`
2. **`src/pages/NewLanding.tsx`** - Guardar `signupSource` en localStorage segun el boton
3. **`src/hooks/useAuth.ts`** - Leer `signupSource` tras SIGNED_IN y redirigir a checkout si es `paid_card`
4. **`supabase/functions/check-founder-status/index.ts`** - Aceptar y guardar `signup_source`
5. **`supabase/functions/create-checkout-session/index.ts`** - Aceptar price_id opcional del body
6. **`supabase/functions/admin-users-list/index.ts`** - Incluir `signup_source` en response
7. **`src/components/admin/UsersManager.tsx`** - Mostrar indicador de signup_source
8. **`src/integrations/supabase/types.ts`** - Se actualizara automaticamente con la migracion

## Stripe

- Crear producto: "Early Adopter $9.90" con precio $9.90/ano recurring
- Guardar price_id en `general_settings`

