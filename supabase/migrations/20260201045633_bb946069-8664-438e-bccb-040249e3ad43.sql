-- Add is_pioneer column to profiles table for Founding Members badge
ALTER TABLE public.profiles 
ADD COLUMN is_pioneer boolean NOT NULL DEFAULT false;