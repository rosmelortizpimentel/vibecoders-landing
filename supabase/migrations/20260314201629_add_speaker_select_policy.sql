CREATE POLICY "Users can read their own speaker record"
ON public.speakers
FOR SELECT
TO public
USING (auth.uid() = user_id);
