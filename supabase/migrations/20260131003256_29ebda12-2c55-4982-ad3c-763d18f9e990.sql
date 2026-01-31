-- Add member_number column with auto-increment sequence
CREATE SEQUENCE IF NOT EXISTS profiles_member_number_seq START WITH 1;

ALTER TABLE public.profiles 
ADD COLUMN member_number INTEGER DEFAULT nextval('profiles_member_number_seq');

-- Set member_number for existing profiles based on created_at order
WITH numbered_profiles AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM public.profiles
)
UPDATE public.profiles p
SET member_number = np.rn
FROM numbered_profiles np
WHERE p.id = np.id;

-- Make it NOT NULL after setting values
ALTER TABLE public.profiles 
ALTER COLUMN member_number SET NOT NULL;

-- Create unique constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_member_number_unique UNIQUE (member_number);