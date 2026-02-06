
-- Create user_activity_log table for transparent daily activity tracking
CREATE TABLE public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, active_date)
);

-- Enable RLS
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can insert their own activity (transparent upsert)
CREATE POLICY "Users can insert own activity"
ON public.user_activity_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Index for efficient daily activity queries
CREATE INDEX idx_user_activity_log_date ON public.user_activity_log(active_date);
CREATE INDEX idx_user_activity_log_user ON public.user_activity_log(user_id);
