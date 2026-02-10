-- Allow testers to update their own feedback (for responding to resolution)
CREATE POLICY "Testers can update own feedback"
ON public.beta_feedback
FOR UPDATE
USING (auth.uid() = tester_id)
WITH CHECK (auth.uid() = tester_id);
