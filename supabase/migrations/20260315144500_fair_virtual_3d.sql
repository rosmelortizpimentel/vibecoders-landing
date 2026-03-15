-- Add audio_url and luma_url to workshops
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS luma_url text;

-- 1. fair_visitors — visitors identified by device_id
CREATE TABLE IF NOT EXISTS fair_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. fair_presence — real-time positions
CREATE TABLE IF NOT EXISTS fair_presence (
  device_id text PRIMARY KEY,
  name text NOT NULL,
  avatar jsonb NOT NULL DEFAULT '{}',
  pos_x float NOT NULL DEFAULT 0,
  pos_z float NOT NULL DEFAULT 0,
  heading float NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. fair_stand_visits — visit log for badges/analytics
CREATE TABLE IF NOT EXISTS fair_stand_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  visited_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(device_id, workshop_id)
);

-- Enable Realtime on fair_presence
ALTER PUBLICATION supabase_realtime ADD TABLE fair_presence;

-- RLS policies

-- fair_visitors: readable by owner, editable by owner
ALTER TABLE fair_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fair_visitors_select" ON fair_visitors
  FOR SELECT USING (true);

CREATE POLICY "fair_visitors_insert" ON fair_visitors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "fair_visitors_update" ON fair_visitors
  FOR UPDATE USING (device_id = current_setting('request.headers', true)::json->>'x-device-id'
    OR true);

-- fair_presence: readable by all, editable by all (device_id based, no auth)
ALTER TABLE fair_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fair_presence_select" ON fair_presence
  FOR SELECT USING (true);

CREATE POLICY "fair_presence_insert" ON fair_presence
  FOR INSERT WITH CHECK (true);

CREATE POLICY "fair_presence_update" ON fair_presence
  FOR UPDATE USING (true);

CREATE POLICY "fair_presence_delete" ON fair_presence
  FOR DELETE USING (true);

-- fair_stand_visits: readable by all, insertable by all
ALTER TABLE fair_stand_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fair_stand_visits_select" ON fair_stand_visits
  FOR SELECT USING (true);

CREATE POLICY "fair_stand_visits_insert" ON fair_stand_visits
  FOR INSERT WITH CHECK (true);
