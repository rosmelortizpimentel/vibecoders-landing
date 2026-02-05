-- =============================================
-- Profile Analytics Tables
-- Optimized for high-volume writes
-- =============================================

-- 1. Profile Views Table
CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  device_fingerprint text NOT NULL,
  device_type text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for profile_views
CREATE INDEX idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX idx_profile_views_created_at ON public.profile_views(created_at);
CREATE INDEX idx_profile_views_fingerprint_profile ON public.profile_views(device_fingerprint, profile_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only profile owner can view their stats
CREATE POLICY "Profile owners can view their views"
  ON public.profile_views
  FOR SELECT
  USING (auth.uid() = profile_id);

-- No direct insert from client - will use edge function with service role
-- But we need a policy for the edge function to work
CREATE POLICY "Allow insert via service role"
  ON public.profile_views
  FOR INSERT
  WITH CHECK (true);

-- 2. App Clicks Table
CREATE TABLE public.app_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  device_fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for app_clicks
CREATE INDEX idx_app_clicks_app_id ON public.app_clicks(app_id);
CREATE INDEX idx_app_clicks_profile_id ON public.app_clicks(profile_id);
CREATE INDEX idx_app_clicks_created_at ON public.app_clicks(created_at);

-- Enable RLS
ALTER TABLE public.app_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only profile owner can view their stats
CREATE POLICY "Profile owners can view their app clicks"
  ON public.app_clicks
  FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Allow insert via service role"
  ON public.app_clicks
  FOR INSERT
  WITH CHECK (true);

-- 3. App Likes Table
CREATE TABLE public.app_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, user_id)
);

-- Indexes for app_likes
CREATE INDEX idx_app_likes_app_id ON public.app_likes(app_id);
CREATE INDEX idx_app_likes_user_id ON public.app_likes(user_id);

-- Enable RLS
ALTER TABLE public.app_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_likes
-- Anyone can see like counts (for displaying heart count)
CREATE POLICY "Anyone can view app likes"
  ON public.app_likes
  FOR SELECT
  USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Authenticated users can like apps"
  ON public.app_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can unlike apps"
  ON public.app_likes
  FOR DELETE
  USING (auth.uid() = user_id);