-- Add privacy preferences to profiles table
ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "allow_analytics" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "allow_marketing" BOOLEAN DEFAULT false;

-- Add comments for postgrest reflection
COMMENT ON COLUMN "public"."profiles"."allow_analytics" IS 'Whether the user has opted in to Microsoft Clarity usage analytics';
COMMENT ON COLUMN "public"."profiles"."allow_marketing" IS 'Whether the user has opted in to receive marketing emails';
