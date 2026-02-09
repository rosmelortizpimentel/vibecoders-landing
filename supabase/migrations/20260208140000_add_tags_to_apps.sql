-- Add tags column to apps table
ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Force schema reload
NOTIFY pgrst, 'reload schema';
