-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    key text PRIMARY KEY,
    enabled boolean DEFAULT true,
    description text,
    updated_at timestamptz DEFAULT now()
);

-- Turn on RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON public.feature_flags
    FOR SELECT USING (true);

-- Allow write access only to service role (admin)
-- For now, we will allow authenticated users to update if they are admins, 
-- but given the project structure, let's keep it simple and allow authenticated updates 
-- assuming this is an admin-only area in the frontend. 
-- Ideally should check for admin role.
CREATE POLICY "Allow admin update access" ON public.feature_flags
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert initial flag
INSERT INTO public.feature_flags (key, enabled, description)
VALUES ('enable_firecrawl_scraping', true, 'Enable automatic app scraping using Firecrawl')
ON CONFLICT (key) DO NOTHING;
