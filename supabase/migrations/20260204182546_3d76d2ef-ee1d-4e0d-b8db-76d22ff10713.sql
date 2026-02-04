-- Allow public read access to profiles for OG metadata
-- This is safe because profile data is already publicly visible via get-public-profile edge function

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
TO anon, authenticated
USING (true);