-- Update general_settings to point to the new Builder Pro 19.90 plan
UPDATE general_settings SET value = 'price_1T7TpUEK9buyjfG9GSgLhOcQ', updated_at = now() WHERE key = 'stripe_active_price_id';
UPDATE general_settings SET value = '19.90', updated_at = now() WHERE key = 'stripe_active_price_amount';
UPDATE general_settings SET value = 'Builder Pro 19.90', updated_at = now() WHERE key = 'stripe_active_product_name';