-- Add og_image_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN og_image_url text;