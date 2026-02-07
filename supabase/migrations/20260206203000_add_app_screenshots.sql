-- Add screenshots column to apps table
ALTER TABLE public.apps
ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}'::TEXT[];

-- Ensure RLS allows selecting the new column
-- (Implicitly covered by existing SELECT policies)
