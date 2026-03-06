-- Add Open to Partnerships columns to apps table
ALTER TABLE public.apps
ADD COLUMN open_to_partnerships BOOLEAN DEFAULT false;

ALTER TABLE public.apps
ADD COLUMN partnership_types TEXT[] DEFAULT '{}'::TEXT[];
