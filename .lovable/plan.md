

## Limpiar y corregir la configuracion de precios de Stripe

### Problema actual

Hay 10 settings de Stripe en `general_settings`, muchos redundantes o desactualizados. El precio activo apunta a $24/ano cuando deberia apuntar a $9.90/ano.

### Cambios en la base de datos (general_settings)

1. **Actualizar `stripe_active_price_id`** de `price_1SzoOTEK9buyjfG9HP7bspLX` ($24) a `price_1T07aoEK9buyjfG9VsJ3R1te` ($9.90)

2. **Actualizar `stripe_active_price_amount`** de `24` a `9.90`

3. **Actualizar `stripe_active_product_name`** de `Vibe Coders Pro` a `Vibe Coder Pro Early Adopter` (o el nombre que prefieras)

4. **Eliminar settings redundantes** que ya no se usan y solo generan confusion:
   - `stripe_early_adopter_990_price_id` (ya estara como el activo)
   - `stripe_early_adopter_price_id` (plan de $12, obsoleto)
   - `stripe_early_adopter_price_amount` (obsoleto)
   - `stripe_early_adopter_product_name` (obsoleto)

5. **Mantener** los siguientes para referencia futura:
   - `stripe_active_price_id` = $9.90 (el activo)
   - `stripe_active_price_amount` = 9.90
   - `stripe_active_product_name` = nombre del plan activo
   - `stripe_allow_coupons` = true
   - `stripe_pro_price_id` = $24 (para cuando suba el precio)
   - `stripe_test_price_id` = $1 (para pruebas)

### Resultado

Despues de estos cambios, `create-checkout-session` usara automaticamente el precio de $9.90/ano porque lee `stripe_active_price_id` de la tabla. Los settings quedaran limpios y claros: solo 6 entradas en lugar de 10.

### Detalle tecnico

Se ejecutara una migracion SQL con:

```text
-- 1. Actualizar el precio activo a $9.90
UPDATE general_settings SET value = 'price_1T07aoEK9buyjfG9VsJ3R1te' WHERE key = 'stripe_active_price_id';
UPDATE general_settings SET value = '9.90' WHERE key = 'stripe_active_price_amount';
UPDATE general_settings SET value = 'Vibe Coder Pro Early Adopter' WHERE key = 'stripe_active_product_name';

-- 2. Eliminar settings obsoletos
DELETE FROM general_settings WHERE key IN (
  'stripe_early_adopter_990_price_id',
  'stripe_early_adopter_price_id',
  'stripe_early_adopter_price_amount',
  'stripe_early_adopter_product_name'
);
```

No se requieren cambios en el codigo -- `create-checkout-session` ya lee dinamicamente de `general_settings`.

