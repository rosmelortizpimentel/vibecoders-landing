-- Update notifications foreign key to support cascading deletes from system_broadcasts
BEGIN;

-- Drop existing constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_broadcast_id_fkey;

-- Add new constraint with ON DELETE CASCADE
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_broadcast_id_fkey 
FOREIGN KEY (broadcast_id) 
REFERENCES public.system_broadcasts(id) 
ON DELETE CASCADE;

COMMIT;
