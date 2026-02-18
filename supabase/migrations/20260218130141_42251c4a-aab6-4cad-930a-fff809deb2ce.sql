
-- =============================================
-- ROADMAP & FEEDBACK ENGINE - Phase 1
-- =============================================

-- 1. Roadmap Settings (per app)
CREATE TABLE public.roadmap_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  custom_title TEXT,
  font_family TEXT DEFAULT 'Inter',
  favicon_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(app_id)
);

ALTER TABLE public.roadmap_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own roadmap settings"
  ON public.roadmap_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM apps WHERE apps.id = roadmap_settings.app_id AND apps.user_id = auth.uid()));

CREATE POLICY "Public can view public roadmap settings"
  ON public.roadmap_settings FOR SELECT
  USING (is_public = true);

-- 2. Roadmap Lanes
CREATE TABLE public.roadmap_lanes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3D5AFE',
  font TEXT DEFAULT 'Inter',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmap_lanes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own lanes"
  ON public.roadmap_lanes FOR ALL
  USING (EXISTS (SELECT 1 FROM apps WHERE apps.id = roadmap_lanes.app_id AND apps.user_id = auth.uid()));

CREATE POLICY "Public can view lanes of public roadmaps"
  ON public.roadmap_lanes FOR SELECT
  USING (EXISTS (SELECT 1 FROM roadmap_settings WHERE roadmap_settings.app_id = roadmap_lanes.app_id AND roadmap_settings.is_public = true));

-- 3. Roadmap Cards
CREATE TABLE public.roadmap_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  lane_id UUID NOT NULL REFERENCES public.roadmap_lanes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmap_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own cards"
  ON public.roadmap_cards FOR ALL
  USING (EXISTS (SELECT 1 FROM apps WHERE apps.id = roadmap_cards.app_id AND apps.user_id = auth.uid()));

CREATE POLICY "Public can view cards of public roadmaps"
  ON public.roadmap_cards FOR SELECT
  USING (EXISTS (SELECT 1 FROM roadmap_settings WHERE roadmap_settings.app_id = roadmap_cards.app_id AND roadmap_settings.is_public = true));

-- 4. Roadmap Feedback (anonymous)
CREATE TABLE public.roadmap_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  linked_card_id UUID REFERENCES public.roadmap_cards(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  owner_response TEXT,
  owner_response_at TIMESTAMPTZ,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmap_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON public.roadmap_feedback FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roadmap_settings WHERE roadmap_settings.app_id = roadmap_feedback.app_id AND roadmap_settings.is_public = true));

CREATE POLICY "Anyone can view feedback of public roadmaps"
  ON public.roadmap_feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM roadmap_settings WHERE roadmap_settings.app_id = roadmap_feedback.app_id AND roadmap_settings.is_public = true));

CREATE POLICY "Owners can manage feedback"
  ON public.roadmap_feedback FOR ALL
  USING (EXISTS (SELECT 1 FROM apps WHERE apps.id = roadmap_feedback.app_id AND apps.user_id = auth.uid()));

-- 5. Feedback Attachments
CREATE TABLE public.roadmap_feedback_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.roadmap_feedback(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmap_feedback_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert attachments for feedback"
  ON public.roadmap_feedback_attachments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view feedback attachments"
  ON public.roadmap_feedback_attachments FOR SELECT
  USING (true);

CREATE POLICY "Owners can delete feedback attachments"
  ON public.roadmap_feedback_attachments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM roadmap_feedback rf
    JOIN apps ON apps.id = rf.app_id
    WHERE rf.id = roadmap_feedback_attachments.feedback_id AND apps.user_id = auth.uid()
  ));

-- 6. Feedback Likes (by fingerprint)
CREATE TABLE public.roadmap_feedback_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.roadmap_feedback(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(feedback_id, device_fingerprint)
);

ALTER TABLE public.roadmap_feedback_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can like feedback"
  ON public.roadmap_feedback_likes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view likes"
  ON public.roadmap_feedback_likes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can unlike by fingerprint"
  ON public.roadmap_feedback_likes FOR DELETE
  USING (true);

-- 7. Trigger to sync likes_count
CREATE OR REPLACE FUNCTION public.update_feedback_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE roadmap_feedback SET likes_count = likes_count + 1 WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE roadmap_feedback SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trg_feedback_likes_count
AFTER INSERT OR DELETE ON public.roadmap_feedback_likes
FOR EACH ROW EXECUTE FUNCTION public.update_feedback_likes_count();

-- 8. Updated_at triggers
CREATE TRIGGER update_roadmap_settings_updated_at
BEFORE UPDATE ON public.roadmap_settings
FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

CREATE TRIGGER update_roadmap_cards_updated_at
BEFORE UPDATE ON public.roadmap_cards
FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

CREATE TRIGGER update_roadmap_feedback_updated_at
BEFORE UPDATE ON public.roadmap_feedback
FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

-- 9. Storage bucket for roadmap attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('roadmap-attachments', 'roadmap-attachments', true);

CREATE POLICY "Anyone can upload roadmap attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'roadmap-attachments');

CREATE POLICY "Anyone can view roadmap attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'roadmap-attachments');

CREATE POLICY "Admins can delete roadmap attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'roadmap-attachments' AND public.has_role(auth.uid(), 'admin'));

-- 10. Indexes
CREATE INDEX idx_roadmap_lanes_app ON public.roadmap_lanes(app_id);
CREATE INDEX idx_roadmap_cards_lane ON public.roadmap_cards(lane_id);
CREATE INDEX idx_roadmap_cards_app ON public.roadmap_cards(app_id);
CREATE INDEX idx_roadmap_feedback_app ON public.roadmap_feedback(app_id);
CREATE INDEX idx_roadmap_feedback_likes ON public.roadmap_feedback(likes_count DESC);
CREATE INDEX idx_roadmap_feedback_likes_fp ON public.roadmap_feedback_likes(feedback_id, device_fingerprint);
