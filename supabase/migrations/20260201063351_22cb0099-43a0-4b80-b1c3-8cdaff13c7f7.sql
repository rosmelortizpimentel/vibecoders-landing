-- Crear tabla general_settings para configuraciones globales
CREATE TABLE public.general_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: Lectura pública, sin escritura desde frontend
ALTER TABLE public.general_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON public.general_settings FOR SELECT
  USING (true);

-- Insertar badge URL placeholder (se actualizará con la imagen real)
INSERT INTO public.general_settings (key, value, description)
VALUES (
  'pioneer_badge_url',
  'https://zkotnnmrehzqonlyeorv.supabase.co/storage/v1/object/public/profile-assets/badges/pioneer-badge.png',
  'URL de la imagen del badge para Founding Members'
);