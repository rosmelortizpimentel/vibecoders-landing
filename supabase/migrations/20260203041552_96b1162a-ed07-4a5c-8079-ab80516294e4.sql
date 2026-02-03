-- =============================================
-- 1. Crear bucket stack-assets
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('stack-assets', 'stack-assets', true);

-- Política: Lectura pública
CREATE POLICY "Public read stack assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'stack-assets');

-- Política: Solo admins pueden subir
CREATE POLICY "Admins can upload stack assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stack-assets' 
  AND has_role(auth.uid(), 'admin')
);

-- Política: Solo admins pueden actualizar
CREATE POLICY "Admins can update stack assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stack-assets' 
  AND has_role(auth.uid(), 'admin')
);

-- Política: Solo admins pueden eliminar
CREATE POLICY "Admins can delete stack assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stack-assets' 
  AND has_role(auth.uid(), 'admin')
);

-- =============================================
-- 2. Crear tabla tools_library
-- =============================================
CREATE TABLE public.tools_library (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  tagline text NOT NULL,
  logo_url text,
  website_url text NOT NULL,
  category text NOT NULL,
  pricing_model text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order numeric NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.tools_library ENABLE ROW LEVEL SECURITY;

-- Lectura pública de herramientas activas
CREATE POLICY "Public view active tools"
ON public.tools_library FOR SELECT
USING (is_active = true);

-- Admins pueden ver todas (incluyendo inactivas)
CREATE POLICY "Admins view all tools"
ON public.tools_library FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Solo admins pueden insertar
CREATE POLICY "Admins can insert tools"
ON public.tools_library FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Solo admins pueden actualizar
CREATE POLICY "Admins can update tools"
ON public.tools_library FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Solo admins pueden eliminar
CREATE POLICY "Admins can delete tools"
ON public.tools_library FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- 3. Datos iniciales
-- =============================================
INSERT INTO public.tools_library (name, tagline, website_url, category, pricing_model, is_featured, display_order) VALUES
  ('Lovable', 'Fullstack AI development', 'https://lovable.dev', 'Frontend AI', 'Free Tier', true, 0),
  ('Supabase', 'Backend as a Service', 'https://supabase.com', 'Backend', 'Free Tier', true, 1),
  ('Vercel', 'Deploy with zero config', 'https://vercel.com', 'Hosting', 'Free Tier', false, 2);