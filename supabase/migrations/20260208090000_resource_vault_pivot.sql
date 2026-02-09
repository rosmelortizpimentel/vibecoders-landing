-- Create new enum types for Resource Vault (if they don't exist)
DO $$ BEGIN
    CREATE TYPE resource_type AS ENUM ('chat_prompt', 'system_rule', 'file_template');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE intent_category AS ENUM ('ui_gen', 'backend_logic', 'app_config', 'branding_assets', 'database', 'testing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to prompts table
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS resource_type resource_type DEFAULT 'chat_prompt',
ADD COLUMN IF NOT EXISTS intent_category intent_category DEFAULT 'ui_gen',
ADD COLUMN IF NOT EXISTS tool_compatibility text[] DEFAULT ARRAY['Cursor', 'Lovable'],
ADD COLUMN IF NOT EXISTS filename text,
ADD COLUMN IF NOT EXISTS result_url text; -- Ensure result_url exists

-- Update existing prompts to have default values
UPDATE prompts SET resource_type = 'chat_prompt' WHERE resource_type IS NULL;
UPDATE prompts SET intent_category = 'ui_gen' WHERE intent_category IS NULL;
UPDATE prompts SET tool_compatibility = ARRAY['Cursor', 'Lovable'] WHERE tool_compatibility IS NULL;
