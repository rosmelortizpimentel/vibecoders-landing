-- Add file_path column to beta_feedback_attachments
ALTER TABLE beta_feedback_attachments ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Update existing records if possible (optional, but good for consistency)
-- This assumes the path can be derived from the URL if needed, but for new uploads it will be populated.
