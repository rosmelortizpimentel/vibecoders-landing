-- Add lovable field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lovable TEXT;