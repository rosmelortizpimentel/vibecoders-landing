
CREATE OR REPLACE FUNCTION public.assign_founder_tier(p_user_id uuid)
 RETURNS TABLE(tier text, founder_number integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_max_number integer;
  v_next_number integer;
  v_tier text;
  v_founder_number integer;
BEGIN
  LOCK TABLE public.user_subscriptions IN SHARE ROW EXCLUSIVE MODE;

  SELECT us.tier, us.founder_number INTO v_tier, v_founder_number
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;

  IF FOUND AND v_tier != 'pending' THEN
    RETURN QUERY SELECT v_tier, v_founder_number;
    RETURN;
  END IF;

  -- Use MAX founder_number instead of COUNT to respect the #100 cap
  SELECT COALESCE(MAX(us.founder_number), 20) INTO v_max_number
  FROM public.user_subscriptions us
  WHERE us.founder_number IS NOT NULL;

  IF v_max_number < 100 THEN
    v_next_number := v_max_number + 1;
    v_tier := 'founder';
    v_founder_number := v_next_number;
  ELSE
    v_tier := 'free';
    v_founder_number := NULL;
  END IF;

  INSERT INTO public.user_subscriptions (user_id, tier, founder_number, price)
  VALUES (p_user_id, v_tier, v_founder_number, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    tier = EXCLUDED.tier,
    founder_number = EXCLUDED.founder_number,
    updated_at = now();

  RETURN QUERY SELECT v_tier, v_founder_number;
END;
$function$;

-- Fix any existing records with founder_number > 100
UPDATE public.user_subscriptions
SET tier = 'free', founder_number = NULL, updated_at = now()
WHERE founder_number > 100 AND tier = 'founder';
