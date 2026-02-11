-- Create the 'broadcasts' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'broadcasts', 'broadcasts', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'broadcasts'
);

-- Policy to allow authenticated users to view objects (to see images in notifications)
CREATE POLICY "Authenticated users can view broadcast images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'broadcasts' AND
    auth.role() = 'authenticated'
);

-- Policy to allow admins to upload objects
CREATE POLICY "Admins can upload broadcast images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'broadcasts' AND
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Policy to allow admins to delete objects
CREATE POLICY "Admins can delete broadcast images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'broadcasts' AND
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);
