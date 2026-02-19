-- Allow app owners to insert bug reports into beta_feedback
CREATE POLICY "App owners can insert feedback"
ON public.beta_feedback
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.apps
    WHERE apps.id = beta_feedback.app_id
    AND apps.user_id = auth.uid()
  )
);