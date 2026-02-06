-- Allow admins to delete feedback threads (cascade will delete messages and attachments)
CREATE POLICY "Admins can delete threads"
ON public.feedback_threads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete messages
CREATE POLICY "Admins can delete messages"
ON public.feedback_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete attachments
CREATE POLICY "Admins can delete attachments"
ON public.feedback_attachments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));