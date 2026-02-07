-- Allow app owners to add testers to their own apps
CREATE POLICY "App owners can add testers"
ON public.beta_testers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.apps
    WHERE apps.id = beta_testers.app_id
    AND apps.user_id = auth.uid()
  )
);
