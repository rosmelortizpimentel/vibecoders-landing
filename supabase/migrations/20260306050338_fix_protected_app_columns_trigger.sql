-- Fix protect_app_columns function to allow service_role and supabase_admin correctly
CREATE OR REPLACE FUNCTION "public"."protect_app_columns"() 
RETURNS "trigger" 
LANGUAGE "plpgsql" 
SECURITY DEFINER
SET "search_path" TO 'public', 'extensions', 'auth'
AS $$
BEGIN
  -- Check if any verification column is being changed
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified
    OR NEW.verification_token IS DISTINCT FROM OLD.verification_token
    OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
    OR NEW.verified_url IS DISTINCT FROM OLD.verified_url
  THEN
    -- Allow service_role or supabase_admin (Edge Functions) to modify verification columns
    -- We check the JWT role claim AND the session user for robustness
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' 
       AND session_user IS DISTINCT FROM 'service_role'
       AND session_user IS DISTINCT FROM 'supabase_admin'
    THEN
      RAISE EXCEPTION 'Cannot modify protected app verification columns';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
