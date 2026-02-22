-- Migration: notifications_triggers_v2.sql

-- 1. Trigger for beta_accepted
CREATE OR REPLACE FUNCTION public.handle_beta_tester_accepted()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if it was accepted (status changed from pending/rejected to accepted)
    IF (NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted')) THEN
        -- Check if notification type is enabled
        IF (SELECT enabled FROM public.notification_configs WHERE type = 'beta_accepted') THEN
            -- We need to find the app owner to get app name for meta
            DECLARE
                v_app_name text;
            BEGIN
                SELECT name INTO v_app_name FROM public.apps WHERE id = NEW.app_id;
                
                INSERT INTO public.notifications (
                    recipient_id,
                    actor_id,
                    type,
                    resource_id,
                    meta
                ) VALUES (
                    NEW.user_id, -- recipient is the tester
                    (SELECT user_id FROM public.apps WHERE id = NEW.app_id), -- actor is app owner
                    'beta_accepted',
                    NEW.app_id,
                    jsonb_build_object('app_name', COALESCE(v_app_name, 'App'))
                );
            EXCEPTION WHEN OTHERS THEN
                -- Log error but don't stop the update
                RAISE WARNING 'Error sending beta_accepted notification: %', SQLERRM;
            END;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_beta_tester_accepted ON public.beta_testers;
CREATE TRIGGER tr_beta_tester_accepted
    AFTER UPDATE ON public.beta_testers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_beta_tester_accepted();


-- 2. Trigger for feedback_status
CREATE OR REPLACE FUNCTION public.handle_feedback_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_recipient_id uuid;
    v_actor_id uuid;
    v_app_name text;
BEGIN
    -- Only trigger on status change
    IF (NEW.status != OLD.status) THEN
        -- Check if enabled
        IF (SELECT enabled FROM public.notification_configs WHERE type = 'feedback_status') THEN
            
            SELECT name INTO v_app_name FROM public.apps WHERE id = NEW.app_id;

            -- Determine recipient and actor based on who triggered it
            -- If owner changed it, notify tester. If tester closed it, notify owner.
            -- Using auth.uid() to identify who's acting
            
            IF (auth.uid() = NEW.tester_id) THEN
                -- Tester acting (e.g., confirming resolution) -> Notify Owner
                SELECT user_id INTO v_recipient_id FROM public.apps WHERE id = NEW.app_id;
                v_actor_id := NEW.tester_id;
            ELSE
                -- Owner acting -> Notify Tester
                v_recipient_id := NEW.tester_id;
                SELECT user_id INTO v_actor_id FROM public.apps WHERE id = NEW.app_id;
            END IF;

            INSERT INTO public.notifications (
                recipient_id,
                actor_id,
                type,
                resource_id,
                resource_slug,
                meta
            ) VALUES (
                v_recipient_id,
                v_actor_id,
                'feedback_status',
                NEW.id, -- feedback_id
                NEW.app_id,
                jsonb_build_object(
                    'app_name', COALESCE(v_app_name, 'App'),
                    'new_status', NEW.status,
                    'old_status', OLD.status
                )
            );
        END IF;
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error sending feedback_status notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_feedback_status_change ON public.beta_feedback;
CREATE TRIGGER tr_feedback_status_change
    AFTER UPDATE ON public.beta_feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_feedback_status_change();
