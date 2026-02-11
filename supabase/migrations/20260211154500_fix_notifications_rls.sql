-- Allow admins to insert notifications for any user (broadcast)
-- Using the project's standard has_role function
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Admins can insert notifications' 
        AND tablename = 'notifications'
    ) THEN
        CREATE POLICY "Admins can insert notifications" ON public.notifications
            FOR INSERT 
            WITH CHECK (
                public.has_role(auth.uid(), 'admin')
            );
    END IF;
END
$$;
