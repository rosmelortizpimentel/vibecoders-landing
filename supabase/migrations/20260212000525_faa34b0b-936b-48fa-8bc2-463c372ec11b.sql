
-- Table: user_subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'pending',
  founder_number integer,
  price decimal DEFAULT 0,
  stripe_customer_id text,
  subscription_id text,
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (for initial creation)
CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update only via service role (edge functions use service role key)
-- No UPDATE policy for regular users

-- Function to assign founder tier atomically
CREATE OR REPLACE FUNCTION public.assign_founder_tier(p_user_id uuid)
RETURNS TABLE(tier text, founder_number integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_founder_count integer;
  v_next_number integer;
  v_tier text;
  v_founder_number integer;
BEGIN
  -- Lock to prevent race conditions
  LOCK TABLE public.user_subscriptions IN SHARE ROW EXCLUSIVE MODE;

  -- Check if user already has a subscription
  SELECT us.tier, us.founder_number INTO v_tier, v_founder_number
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id;

  IF FOUND AND v_tier != 'pending' THEN
    -- Already assigned, return existing
    RETURN QUERY SELECT v_tier, v_founder_number;
    RETURN;
  END IF;

  -- Count existing founders
  SELECT COUNT(*) INTO v_founder_count
  FROM public.user_subscriptions us
  WHERE us.tier = 'founder';

  IF v_founder_count < 100 THEN
    v_next_number := v_founder_count + 1;
    v_tier := 'founder';
    v_founder_number := v_next_number;
  ELSE
    v_tier := 'pending';
    v_founder_number := NULL;
  END IF;

  -- Upsert the subscription record
  INSERT INTO public.user_subscriptions (user_id, tier, founder_number, price)
  VALUES (p_user_id, v_tier, v_founder_number, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    tier = EXCLUDED.tier,
    founder_number = EXCLUDED.founder_number,
    updated_at = now();

  RETURN QUERY SELECT v_tier, v_founder_number;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();
