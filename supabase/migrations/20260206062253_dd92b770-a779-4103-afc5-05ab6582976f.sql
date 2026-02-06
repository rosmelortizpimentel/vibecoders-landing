-- Add workflow columns to beta_feedback
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS resolved_by_owner BOOLEAN DEFAULT FALSE;
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS tester_response TEXT;
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS tester_response_at TIMESTAMPTZ;

-- Create beta_feedback_attachments table
CREATE TABLE IF NOT EXISTS beta_feedback_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES beta_feedback(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE beta_feedback_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Testers can insert attachments for their own feedback
CREATE POLICY "Testers can insert own attachments"
  ON beta_feedback_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM beta_feedback
    WHERE beta_feedback.id = beta_feedback_attachments.feedback_id
    AND beta_feedback.tester_id = auth.uid()
  ));

-- Policy: Owners and testers can view attachments
CREATE POLICY "View own or owned app attachments"
  ON beta_feedback_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM beta_feedback bf
    JOIN apps ON apps.id = bf.app_id
    WHERE bf.id = beta_feedback_attachments.feedback_id
    AND (bf.tester_id = auth.uid() OR apps.user_id = auth.uid())
  ));

-- Policy: Testers can delete their own attachments
CREATE POLICY "Testers can delete own attachments"
  ON beta_feedback_attachments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM beta_feedback
    WHERE beta_feedback.id = beta_feedback_attachments.feedback_id
    AND beta_feedback.tester_id = auth.uid()
  ));