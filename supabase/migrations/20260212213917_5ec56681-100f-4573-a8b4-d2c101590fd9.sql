-- Paso 1: Agregar columna signup_source a user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS signup_source text DEFAULT NULL;

-- Paso 2: Insertar el price_id del Early Adopter en general_settings
INSERT INTO public.general_settings (key, value, description) 
VALUES ('stripe_early_adopter_990_price_id', 'price_1T07aoEK9buyjfG9VsJ3R1te', 'Price ID del plan Early Adopter $9.90/año')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();