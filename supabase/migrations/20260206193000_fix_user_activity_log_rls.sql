-- Allow users to view their own activity logs
CREATE POLICY "Users can view own activity"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own activity logs (required for UPSERT)
CREATE POLICY "Users can update own activity"
ON public.user_activity_log
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
