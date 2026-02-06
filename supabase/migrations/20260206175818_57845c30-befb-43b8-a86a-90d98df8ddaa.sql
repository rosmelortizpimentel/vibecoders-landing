-- Allow admins to update feedback messages (for editing message content)
CREATE POLICY "Admins can update messages"
ON public.feedback_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));