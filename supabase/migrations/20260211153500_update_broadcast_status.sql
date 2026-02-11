-- Create enum for broadcast status
DO $$ BEGIN
    CREATE TYPE broadcast_status AS ENUM ('draft', 'sent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns to system_broadcasts
ALTER TABLE public.system_broadcasts 
ADD COLUMN IF NOT EXISTS status broadcast_status DEFAULT 'sent',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update existing records to 'sent'
UPDATE public.system_broadcasts SET status = 'sent' WHERE status IS NULL;
