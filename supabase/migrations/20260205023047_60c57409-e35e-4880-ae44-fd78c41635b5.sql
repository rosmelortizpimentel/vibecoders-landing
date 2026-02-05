-- Add fresh_drops_count setting to general_settings
INSERT INTO public.general_settings (key, value, description)
VALUES ('fresh_drops_count', '5', 'Cantidad de startups a mostrar en el carousel Fresh Drops')
ON CONFLICT (key) DO NOTHING;