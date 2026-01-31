
-- =====================================================
-- FASE 1: MODIFICAR TABLA PROFILES
-- =====================================================

-- Agregar campos de perfil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Agregar campos de redes sociales
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS email_public TEXT;

-- Agregar campos de branding
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3D5AFE',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#1c1c1c',
ADD COLUMN IF NOT EXISTS card_style TEXT DEFAULT 'minimal';

-- =====================================================
-- FASE 2: CREAR TABLA APP_CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.app_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para app_categories (tabla de referencia, lectura publica)
ALTER TABLE public.app_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
ON public.app_categories FOR SELECT
USING (true);

-- Insertar categorias iniciales
INSERT INTO public.app_categories (name, slug, icon, display_order) VALUES
  ('Artificial Intelligence', 'ai', 'brain', 1),
  ('Productivity', 'productivity', 'zap', 2),
  ('Education', 'education', 'graduation-cap', 3),
  ('No Code', 'no-code', 'blocks', 4),
  ('Social Media', 'social-media', 'share-2', 5),
  ('E-Commerce', 'e-commerce', 'shopping-cart', 6),
  ('Analytics', 'analytics', 'bar-chart-2', 7),
  ('Web 3', 'web3', 'coins', 8),
  ('Design Tools', 'design-tools', 'palette', 9),
  ('Developer Tools', 'developer-tools', 'code-2', 10),
  ('Marketing', 'marketing', 'megaphone', 11),
  ('Finance', 'finance', 'dollar-sign', 12),
  ('Others', 'others', 'grid-3x3', 99)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- FASE 3: CREAR TABLA APP_STATUSES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.app_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para app_statuses (tabla de referencia, lectura publica)
ALTER TABLE public.app_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view statuses"
ON public.app_statuses FOR SELECT
USING (true);

-- Insertar statuses iniciales
INSERT INTO public.app_statuses (name, slug, color, icon, display_order) VALUES
  ('Building...', 'building', '#FFA500', 'construction', 1),
  ('Active', 'active', '#22C55E', 'circle-dot', 2),
  ('On Hold', 'on-hold', '#9CA3AF', 'pause-circle', 3),
  ('For Sale', 'for-sale', '#F59E0B', 'hand-coins', 4),
  ('Acquired', 'acquired', '#10B981', 'badge-dollar-sign', 5),
  ('Discontinued', 'discontinued', '#EF4444', 'x-circle', 6)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- FASE 4: CREAR TABLA TECH_STACKS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tech_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para tech_stacks (tabla de referencia, lectura publica)
ALTER TABLE public.tech_stacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tech stacks"
ON public.tech_stacks FOR SELECT
USING (true);

-- Insertar tech stacks iniciales con logos de CDN
INSERT INTO public.tech_stacks (name, logo_url, tags, display_order) VALUES
  -- Frontend
  ('React', 'https://cdn.simpleicons.org/react/61DAFB', '["frontend", "framework", "javascript"]'::jsonb, 1),
  ('Vue', 'https://cdn.simpleicons.org/vuedotjs/4FC08D', '["frontend", "framework", "javascript"]'::jsonb, 2),
  ('Angular', 'https://cdn.simpleicons.org/angular/DD0031', '["frontend", "framework", "typescript"]'::jsonb, 3),
  ('Svelte', 'https://cdn.simpleicons.org/svelte/FF3E00', '["frontend", "framework", "javascript"]'::jsonb, 4),
  ('Next.js', 'https://cdn.simpleicons.org/nextdotjs/000000', '["frontend", "framework", "fullstack"]'::jsonb, 5),
  ('Remix', 'https://cdn.simpleicons.org/remix/000000', '["frontend", "framework", "fullstack"]'::jsonb, 6),
  ('Astro', 'https://cdn.simpleicons.org/astro/FF5D01', '["frontend", "framework", "static"]'::jsonb, 7),
  -- Backend
  ('Node.js', 'https://cdn.simpleicons.org/nodedotjs/339933', '["backend", "runtime", "javascript"]'::jsonb, 10),
  ('Python', 'https://cdn.simpleicons.org/python/3776AB', '["backend", "language"]'::jsonb, 11),
  ('Go', 'https://cdn.simpleicons.org/go/00ADD8', '["backend", "language"]'::jsonb, 12),
  ('Rust', 'https://cdn.simpleicons.org/rust/000000', '["backend", "language"]'::jsonb, 13),
  ('Java', 'https://cdn.simpleicons.org/openjdk/000000', '["backend", "language"]'::jsonb, 14),
  ('PHP', 'https://cdn.simpleicons.org/php/777BB4', '["backend", "language"]'::jsonb, 15),
  ('Ruby', 'https://cdn.simpleicons.org/ruby/CC342D', '["backend", "language"]'::jsonb, 16),
  -- Database
  ('PostgreSQL', 'https://cdn.simpleicons.org/postgresql/4169E1', '["database", "sql"]'::jsonb, 20),
  ('MySQL', 'https://cdn.simpleicons.org/mysql/4479A1', '["database", "sql"]'::jsonb, 21),
  ('MongoDB', 'https://cdn.simpleicons.org/mongodb/47A248', '["database", "nosql"]'::jsonb, 22),
  ('Redis', 'https://cdn.simpleicons.org/redis/DC382D', '["database", "cache"]'::jsonb, 23),
  ('Supabase', 'https://cdn.simpleicons.org/supabase/3FCF8E', '["database", "baas", "backend"]'::jsonb, 24),
  -- Cloud
  ('AWS', 'https://cdn.simpleicons.org/amazonaws/FF9900', '["cloud", "infrastructure"]'::jsonb, 30),
  ('Google Cloud', 'https://cdn.simpleicons.org/googlecloud/4285F4', '["cloud", "infrastructure"]'::jsonb, 31),
  ('Azure', 'https://cdn.simpleicons.org/microsoftazure/0078D4', '["cloud", "infrastructure"]'::jsonb, 32),
  ('Vercel', 'https://cdn.simpleicons.org/vercel/000000', '["cloud", "hosting", "frontend"]'::jsonb, 33),
  ('Netlify', 'https://cdn.simpleicons.org/netlify/00C7B7', '["cloud", "hosting", "frontend"]'::jsonb, 34),
  ('Railway', 'https://cdn.simpleicons.org/railway/0B0D0E', '["cloud", "hosting", "backend"]'::jsonb, 35),
  -- Mobile
  ('React Native', 'https://cdn.simpleicons.org/react/61DAFB', '["mobile", "framework", "cross-platform"]'::jsonb, 40),
  ('Flutter', 'https://cdn.simpleicons.org/flutter/02569B', '["mobile", "framework", "cross-platform"]'::jsonb, 41),
  ('Swift', 'https://cdn.simpleicons.org/swift/F05138', '["mobile", "language", "ios"]'::jsonb, 42),
  ('Kotlin', 'https://cdn.simpleicons.org/kotlin/7F52FF', '["mobile", "language", "android"]'::jsonb, 43),
  -- AI/ML
  ('OpenAI', 'https://cdn.simpleicons.org/openai/412991', '["ai", "llm", "api"]'::jsonb, 50),
  ('Anthropic', 'https://cdn.simpleicons.org/anthropic/191919', '["ai", "llm", "api"]'::jsonb, 51),
  ('Hugging Face', 'https://cdn.simpleicons.org/huggingface/FFD21E', '["ai", "ml", "models"]'::jsonb, 52),
  ('LangChain', 'https://cdn.simpleicons.org/langchain/1C3C3C', '["ai", "framework", "llm"]'::jsonb, 53),
  -- Vibe Coding
  ('Lovable', 'https://lovable.dev/favicon.ico', '["vibe-coding", "ai", "no-code"]'::jsonb, 60),
  ('Cursor', 'https://cdn.simpleicons.org/cursor/000000', '["vibe-coding", "ai", "ide"]'::jsonb, 61),
  ('Bolt', 'https://cdn.simpleicons.org/lightning/F7DF1E', '["vibe-coding", "ai", "no-code"]'::jsonb, 62),
  ('v0', 'https://cdn.simpleicons.org/vercel/000000', '["vibe-coding", "ai", "ui"]'::jsonb, 63),
  ('Replit', 'https://cdn.simpleicons.org/replit/F26207', '["vibe-coding", "ide", "cloud"]'::jsonb, 64)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FASE 5: CREAR TABLA APPS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  category_id UUID REFERENCES public.app_categories(id) ON DELETE SET NULL,
  status_id UUID REFERENCES public.app_statuses(id) ON DELETE SET NULL,
  hours_ideation INTEGER DEFAULT 0,
  hours_building INTEGER DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para apps
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Owner puede hacer todo con sus apps
CREATE POLICY "Users can view own apps"
ON public.apps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own apps"
ON public.apps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own apps"
ON public.apps FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own apps"
ON public.apps FOR DELETE
USING (auth.uid() = user_id);

-- Apps visibles son publicas para perfiles publicos
CREATE POLICY "Anyone can view visible apps"
ON public.apps FOR SELECT
USING (is_visible = true);

-- Trigger para updated_at en apps
CREATE TRIGGER update_apps_updated_at
BEFORE UPDATE ON public.apps
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- =====================================================
-- FASE 6: CREAR TABLA APP_STACKS (junction)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.app_stacks (
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  stack_id UUID NOT NULL REFERENCES public.tech_stacks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (app_id, stack_id)
);

-- RLS para app_stacks
ALTER TABLE public.app_stacks ENABLE ROW LEVEL SECURITY;

-- Solo el owner de la app puede modificar los stacks
CREATE POLICY "Users can manage own app stacks"
ON public.app_stacks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.apps 
    WHERE apps.id = app_stacks.app_id 
    AND apps.user_id = auth.uid()
  )
);

-- Lectura publica para apps visibles
CREATE POLICY "Anyone can view stacks of visible apps"
ON public.app_stacks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.apps 
    WHERE apps.id = app_stacks.app_id 
    AND apps.is_visible = true
  )
);

-- =====================================================
-- FASE 7: CREAR STORAGE BUCKET
-- =====================================================

-- Crear bucket publico para assets de perfiles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-assets',
  'profile-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Politica: Cualquiera puede ver los assets
CREATE POLICY "Public can view profile assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-assets');

-- Politica: Solo el owner puede subir a su carpeta
CREATE POLICY "Users can upload own assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politica: Solo el owner puede actualizar sus assets
CREATE POLICY "Users can update own assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politica: Solo el owner puede eliminar sus assets
CREATE POLICY "Users can delete own assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
