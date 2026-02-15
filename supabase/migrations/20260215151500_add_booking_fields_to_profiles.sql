-- Add booking fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_button_text TEXT DEFAULT 'Book a call';

-- Update RLS if needed (usually profiles are already correctly configured for select/update)
-- No changes needed if the existing policies cover all columns in the profiles table.
