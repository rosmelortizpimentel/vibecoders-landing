
-- Set manulara to free tier
INSERT INTO public.user_subscriptions (user_id, tier, founder_number, price)
VALUES ('543bcb31-25ed-4311-9774-e3483077c18e', 'free', NULL, 0)
ON CONFLICT (user_id) DO UPDATE SET
  tier = 'free',
  founder_number = NULL,
  updated_at = now();

-- Add early adopter price to general_settings
INSERT INTO public.general_settings (key, value, description)
VALUES ('stripe_early_adopter_price_id', 'price_1SzsPfEK9buyjfG9l3zhn3j1', 'Stripe Price ID para el plan Early Adopter ($12/año)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.general_settings (key, value, description)
VALUES ('stripe_early_adopter_price_amount', '12', 'Precio del plan Early Adopter en USD')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.general_settings (key, value, description)
VALUES ('stripe_early_adopter_product_name', 'Vibe Coder Pro Early Adopter', 'Nombre del producto Early Adopter en Stripe')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
