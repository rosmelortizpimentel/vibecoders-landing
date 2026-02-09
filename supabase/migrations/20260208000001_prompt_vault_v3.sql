-- Add result_url to prompts
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS result_url TEXT;

-- Add file_role to prompt_files
ALTER TABLE public.prompt_files
ADD COLUMN IF NOT EXISTS file_role TEXT DEFAULT 'attachment';

-- Add check constraint for file_role
ALTER TABLE public.prompt_files
ADD CONSTRAINT prompt_files_file_role_check
CHECK (file_role IN ('attachment', 'result_image'));
