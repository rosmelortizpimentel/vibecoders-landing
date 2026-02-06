-- =============================================
-- BETA SQUADS: Migración completa
-- =============================================

-- 1. Agregar columnas beta_* a tabla apps
ALTER TABLE public.apps
ADD COLUMN IF NOT EXISTS beta_active boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS beta_mode text NOT NULL DEFAULT 'open',
ADD COLUMN IF NOT EXISTS beta_limit integer NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS beta_link text,
ADD COLUMN IF NOT EXISTS beta_instructions text;

-- 2. Crear tabla beta_testers
CREATE TABLE IF NOT EXISTS public.beta_testers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  feedback_count integer NOT NULL DEFAULT 0,
  UNIQUE(app_id, user_id),
  CONSTRAINT beta_testers_status_check CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- 3. Crear tabla beta_feedback
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  tester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  content text NOT NULL,
  rating integer,
  is_useful boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT beta_feedback_type_check CHECK (type IN ('bug', 'ux', 'feature', 'other')),
  CONSTRAINT beta_feedback_rating_check CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

-- 4. Indices para performance
CREATE INDEX IF NOT EXISTS idx_beta_testers_app_id ON public.beta_testers(app_id);
CREATE INDEX IF NOT EXISTS idx_beta_testers_user_id ON public.beta_testers(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_testers_status ON public.beta_testers(status);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_app_id ON public.beta_feedback(app_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_tester_id ON public.beta_feedback(tester_id);

-- 5. Habilitar RLS
ALTER TABLE public.beta_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES para beta_testers
-- =============================================

-- SELECT: Público (para Hall of Fame)
CREATE POLICY "Anyone can view beta testers"
ON public.beta_testers
FOR SELECT
USING (true);

-- INSERT: Solo usuarios autenticados para sí mismos
CREATE POLICY "Users can join beta"
ON public.beta_testers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Solo el dueño de la app puede actualizar status
CREATE POLICY "App owners can update tester status"
ON public.beta_testers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.apps
    WHERE apps.id = beta_testers.app_id
    AND apps.user_id = auth.uid()
  )
);

-- DELETE: Dueño de app o el propio tester
CREATE POLICY "App owners or testers can delete"
ON public.beta_testers
FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.apps
    WHERE apps.id = beta_testers.app_id
    AND apps.user_id = auth.uid()
  )
);

-- =============================================
-- RLS POLICIES para beta_feedback
-- =============================================

-- SELECT: Dueño de la app o el tester que envió
CREATE POLICY "App owners and testers can view feedback"
ON public.beta_feedback
FOR SELECT
USING (
  auth.uid() = tester_id
  OR EXISTS (
    SELECT 1 FROM public.apps
    WHERE apps.id = beta_feedback.app_id
    AND apps.user_id = auth.uid()
  )
);

-- INSERT: Solo testers aceptados
CREATE POLICY "Accepted testers can submit feedback"
ON public.beta_feedback
FOR INSERT
WITH CHECK (
  auth.uid() = tester_id
  AND EXISTS (
    SELECT 1 FROM public.beta_testers
    WHERE beta_testers.app_id = beta_feedback.app_id
    AND beta_testers.user_id = auth.uid()
    AND beta_testers.status = 'accepted'
  )
);

-- UPDATE: Solo dueño de la app (para marcar is_useful)
CREATE POLICY "App owners can update feedback"
ON public.beta_feedback
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.apps
    WHERE apps.id = beta_feedback.app_id
    AND apps.user_id = auth.uid()
  )
);

-- DELETE: Solo dueño de la app
CREATE POLICY "App owners can delete feedback"
ON public.beta_feedback
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.apps
    WHERE apps.id = beta_feedback.app_id
    AND apps.user_id = auth.uid()
  )
);

-- =============================================
-- TRIGGER: Incrementar feedback_count al insertar feedback
-- =============================================

CREATE OR REPLACE FUNCTION public.increment_feedback_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.beta_testers
  SET feedback_count = feedback_count + 1
  WHERE app_id = NEW.app_id AND user_id = NEW.tester_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_feedback_insert ON public.beta_feedback;
CREATE TRIGGER on_feedback_insert
  AFTER INSERT ON public.beta_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_feedback_count();