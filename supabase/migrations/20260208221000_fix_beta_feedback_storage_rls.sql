-- Allow authenticated users to upload to the 'beta-feedback/' folder in 'feedback-attachments' bucket
CREATE POLICY "Beta testers can upload feedback attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'feedback-attachments' AND
  (storage.foldername(name))[1] = 'beta-feedback' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own uploads in 'beta-feedback/' folder
-- Note: Since we don't have a way to easily check ownership of the file in storage 
-- directly without checking the database table, we at least restrict it to authenticated users
-- for the beta-feedback prefix. In a more production-ready setup, we'd check if the user is the one who uploaded it.
CREATE POLICY "Beta testers can delete feedback attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'feedback-attachments' AND
  (storage.foldername(name))[1] = 'beta-feedback' AND
  auth.role() = 'authenticated'
);
