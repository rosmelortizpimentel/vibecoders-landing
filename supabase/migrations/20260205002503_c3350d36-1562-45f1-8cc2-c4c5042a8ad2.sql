-- 1. Nuevos campos en tech_stacks
ALTER TABLE tech_stacks
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS referral_url TEXT,
  ADD COLUMN IF NOT EXISTS referral_param TEXT,
  ADD COLUMN IF NOT EXISTS default_referral_code TEXT;

-- 2. Nuevos campos en tools_library
ALTER TABLE tools_library
  ADD COLUMN IF NOT EXISTS referral_url TEXT,
  ADD COLUMN IF NOT EXISTS referral_param TEXT,
  ADD COLUMN IF NOT EXISTS default_referral_code TEXT;

-- 3. Nueva tabla user_stack_referrals para códigos personalizados por usuario
CREATE TABLE IF NOT EXISTS user_stack_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_id UUID NOT NULL REFERENCES tech_stacks(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stack_id)
);

ALTER TABLE user_stack_referrals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_stack_referrals
CREATE POLICY "Users can view own referral codes"
  ON user_stack_referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral codes"
  ON user_stack_referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes"
  ON user_stack_referrals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own referral codes"
  ON user_stack_referrals FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Políticas RLS para tech_stacks (CRUD para admins)
CREATE POLICY "Admins can insert tech stacks"
  ON tech_stacks FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tech stacks"
  ON tech_stacks FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tech stacks"
  ON tech_stacks FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));