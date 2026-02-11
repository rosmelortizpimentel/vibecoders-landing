-- Create system_broadcasts table
CREATE TABLE IF NOT EXISTS public.system_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    button_text TEXT,
    button_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sent_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.system_broadcasts ENABLE ROW LEVEL SECURITY;

-- Policies for Admins only
CREATE POLICY "Admins can do everything on system_broadcasts"
ON public.system_broadcasts FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Add broadcast_id to notifications to track reads per broadcast
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS broadcast_id UUID REFERENCES public.system_broadcasts(id) ON DELETE SET NULL;

-- Policies for notifications (ensure admins can see all notifications to track reads)
-- Usually notifications reading is restricted to recipient_id = auth.uid().
-- We might need an admin policy to read notifications for tracking.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admins can read all notifications' AND tablename = 'notifications'
    ) THEN
        CREATE POLICY "Admins can read all notifications" ON public.notifications
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END
$$;
