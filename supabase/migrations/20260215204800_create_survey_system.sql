-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    show_comment_field BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create survey_options table
CREATE TABLE IF NOT EXISTS survey_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ordered_option_ids UUID[] NOT NULL,
    comment TEXT,
    skipped BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(survey_id, user_id)
);

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Surveys Policies
CREATE POLICY "Public surveys are viewable by everyone" 
ON surveys FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage surveys" 
ON surveys FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Survey Options Policies
CREATE POLICY "Public survey options are viewable by everyone" 
ON survey_options FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM surveys 
    WHERE surveys.id = survey_options.survey_id AND surveys.is_active = true
  )
);

CREATE POLICY "Admins can manage survey options" 
ON survey_options FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Survey Responses Policies
CREATE POLICY "Users can create their own responses" 
ON survey_responses FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses" 
ON survey_responses FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all survey responses" 
ON survey_responses FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
