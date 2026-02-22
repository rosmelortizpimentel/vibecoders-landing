-- Add column to track when an app was last activated for beta testing
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS beta_updated_at timestamp with time zone;

-- Initialize existing active beta testing dates
UPDATE public.apps SET beta_updated_at = updated_at WHERE beta_active = true;

-- Function to handle before insert/update on apps for beta_active changes
CREATE OR REPLACE FUNCTION public.handle_beta_active_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.beta_active = true THEN
      NEW.beta_updated_at = now();
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If beta is activated, update the timestamp
    IF NEW.beta_active = true AND OLD.beta_active = false THEN
      NEW.beta_updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_beta_active_change ON public.apps;
CREATE TRIGGER on_beta_active_change
  BEFORE INSERT OR UPDATE ON public.apps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_beta_active_change();
