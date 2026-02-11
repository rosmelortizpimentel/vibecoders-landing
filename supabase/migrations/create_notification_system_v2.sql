-- Migration: create_notification_system_v2.sql
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/zkotnnmrehzqonlyeorv/sql/new)

-- 1. Create notification_configs table
CREATE TABLE IF NOT EXISTS public.notification_configs (
    type text PRIMARY KEY,
    label text NOT NULL,
    description text,
    enabled boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_configs ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow read for authenticated' AND tablename = 'notification_configs'
    ) THEN
        CREATE POLICY "Allow read for authenticated" ON public.notification_configs
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow update for admins' AND tablename = 'notification_configs'
    ) THEN
        CREATE POLICY "Allow update for admins" ON public.notification_configs
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END
$$;

-- Seed initial data
INSERT INTO public.notification_configs (type, label, description)
VALUES 
    ('follow', 'Nuevos Seguidores', 'Notifica cuando un usuario comienza a seguirte.'),
    ('app_like', 'Likes en Apps', 'Notifica cuando alguien le da like a una de tus apps.'),
    ('beta_req', 'Solicitudes de Beta', 'Notifica cuando alguien se une a tu Beta Squad.'),
    ('beta_accepted', 'Aceptación en Beta', 'Notifica al tester cuando el dueño de la app lo acepta.'),
    ('beta_feedback', 'Nuevo Feedback / Bug', 'Notifica al dueño cuando un tester envía reporte.'),
    ('feedback_status', 'Cambio de Estado en Reporte', 'Notifica cambios en el estado de reportes (Cerrado/Abierto).'),
    ('system', 'Notificaciones de Sistema', 'Anuncios globales y mensajes de la plataforma.')
ON CONFLICT (type) DO UPDATE SET 
    label = EXCLUDED.label,
    description = EXCLUDED.description;

-- 2. Create function to check if notification is enabled
CREATE OR REPLACE FUNCTION public.is_notification_enabled(p_type text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.notification_configs
        WHERE type = p_type AND enabled = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
