-- Add language preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en'));