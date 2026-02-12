
-- 1. Actualizar el precio activo a $9.90
UPDATE general_settings SET value = 'price_1T07aoEK9buyjfG9VsJ3R1te', updated_at = now() WHERE key = 'stripe_active_price_id';
UPDATE general_settings SET value = '9.90', updated_at = now() WHERE key = 'stripe_active_price_amount';
UPDATE general_settings SET value = 'Vibe Coder Pro Early Adopter', updated_at = now() WHERE key = 'stripe_active_product_name';

-- 2. Eliminar settings obsoletos
DELETE FROM general_settings WHERE key IN (
  'stripe_early_adopter_990_price_id',
  'stripe_early_adopter_price_id',
  'stripe_early_adopter_price_amount',
  'stripe_early_adopter_product_name'
);
