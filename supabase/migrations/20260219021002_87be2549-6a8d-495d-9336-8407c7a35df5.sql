ALTER TABLE public.roadmap_settings 
ADD COLUMN IF NOT EXISTS feedback_auth_mode text NOT NULL DEFAULT 'anonymous',
ADD COLUMN IF NOT EXISTS default_language text DEFAULT NULL;