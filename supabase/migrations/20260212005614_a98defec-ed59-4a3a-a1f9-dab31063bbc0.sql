
INSERT INTO general_settings (key, value, description) VALUES
('stripe_active_price_id', 'price_1SzoATLFgAgDUEYYMsEAQnES', 'Price ID activo para checkout'),
('stripe_active_product_name', 'Builder Pro Test', 'Nombre del plan activo'),
('stripe_active_price_amount', '1', 'Precio en USD del plan activo'),
('stripe_pro_price_id', 'price_1Szo5xLFgAgDUEYYEfYuaFnV', 'Price ID de produccion $24/year'),
('stripe_test_price_id', 'price_1SzoATLFgAgDUEYYMsEAQnES', 'Price ID de pruebas $1/year'),
('stripe_allow_coupons', 'true', 'Activar cupones en checkout')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = now();
