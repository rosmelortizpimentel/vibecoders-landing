

## Recrear productos Stripe, configurar plan activo y cupones

### Problema
Se cambio la cuenta de Stripe (nuevo secret key). Los productos/precios anteriores (`prod_Txitz3oH1wkuMK` / `price_1SznRLLFgAgDUEYY51o3ceGj`) ya no existen en la nueva cuenta. Hay que recrear todo y hacer el sistema configurable.

### Paso 1: Crear productos y precios en Stripe

Usando las herramientas de Stripe:

1. **Builder Pro (produccion)**: $24/year, recurrente anual
2. **Builder Pro Test**: $1/year, recurrente anual (para pruebas)

### Paso 2: Crear cupon VIBECODERS

- Nombre: `VIBECODERS`
- 100% de descuento
- Duracion: `forever`

### Paso 3: Guardar configuracion en `general_settings`

Insertar en `general_settings` las siguientes claves para que el plan activo sea configurable desde el admin:

| Key | Value | Descripcion |
|-----|-------|-------------|
| `stripe_active_price_id` | (price_id del plan de $1 para pruebas) | Price ID activo para checkout |
| `stripe_active_product_name` | Builder Pro Test | Nombre del plan activo |
| `stripe_active_price_amount` | 1 | Precio en USD del plan activo |
| `stripe_pro_price_id` | (price_id del plan de $24) | Price ID de produccion |
| `stripe_test_price_id` | (price_id del plan de $1) | Price ID de pruebas |
| `stripe_allow_coupons` | true | Activar cupones en checkout |

### Paso 4: Actualizar Edge Function `create-checkout-session`

Cambios:
- En lugar de un `PRICE_ID` hardcodeado, leer `stripe_active_price_id` desde `general_settings`
- Si `stripe_allow_coupons` es `true`, agregar `allow_promotion_codes: true` a la sesion de checkout

### Paso 5: Actualizar `stripe-webhook`

- Sin cambios de logica, solo eliminar el precio hardcodeado `price: 24` y dejarlo dinamico leyendo el monto real de la sesion

### Paso 6: Instrucciones para Webhook

Despues de implementar, te dare las instrucciones para configurar el webhook en la nueva cuenta de Stripe:

1. Ir a Stripe Dashboard > Developers > Webhooks
2. Crear endpoint: `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/stripe-webhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copiar el Signing Secret y actualizarlo como `STRIPE_WEBHOOK_SECRET` en los secretos de Supabase

### Orden de ejecucion

1. Crear producto Builder Pro ($24/year) en Stripe
2. Crear producto Builder Pro Test ($1/year) en Stripe
3. Crear cupon VIBECODERS (100% off, forever)
4. Insertar configuracion en `general_settings`
5. Actualizar `create-checkout-session` para leer de `general_settings` y habilitar cupones
6. Actualizar `stripe-webhook` para no hardcodear precio

