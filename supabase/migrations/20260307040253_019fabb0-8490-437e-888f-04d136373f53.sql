
-- Clean up the function created in failed migration
DROP FUNCTION IF EXISTS public.safe_app_select();

-- Create a security definer function that returns verification_token only to app owners
CREATE OR REPLACE FUNCTION public.get_app_verification_token(p_app_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT verification_token 
  FROM apps 
  WHERE id = p_app_id AND user_id = auth.uid()
$$;
