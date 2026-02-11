-- Add popup-related fields to system_broadcasts
ALTER TABLE public.system_broadcasts 
ADD COLUMN IF NOT EXISTS is_popup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_show BOOLEAN DEFAULT false;

-- Comment on columns for clarity
COMMENT ON COLUMN public.system_broadcasts.is_popup IS 'Whether the notification should be displayed as a popup/modal.';
COMMENT ON COLUMN public.system_broadcasts.auto_show IS 'Whether the popup should be shown automatically to the user upon login/entry.';
