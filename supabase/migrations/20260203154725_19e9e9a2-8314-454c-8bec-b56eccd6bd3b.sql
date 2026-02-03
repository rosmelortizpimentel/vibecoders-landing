-- Add RLS policy to allow authenticated users to check their own waitlist status
CREATE POLICY "Allow authenticated users to check their own waitlist status"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (email = lower(auth.jwt() ->> 'email'));