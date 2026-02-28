


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'The refreshed public schema for VibeCoders';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."broadcast_status" AS ENUM (
    'draft',
    'sent'
);


ALTER TYPE "public"."broadcast_status" OWNER TO "postgres";


CREATE TYPE "public"."intent_category" AS ENUM (
    'ui_gen',
    'backend_logic',
    'app_config',
    'branding_assets',
    'database',
    'testing'
);


ALTER TYPE "public"."intent_category" OWNER TO "postgres";


CREATE TYPE "public"."resource_type" AS ENUM (
    'chat_prompt',
    'system_rule',
    'file_template'
);


ALTER TYPE "public"."resource_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."assign_founder_tier"("p_user_id" "uuid") RETURNS TABLE("tier" "text", "founder_number" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
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
$$;


ALTER FUNCTION "public"."assign_founder_tier"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_showcase_apps"() RETURNS TABLE("id" "uuid", "app_name" "text", "app_tagline" "text", "app_logo_url" "text", "app_url" "text", "is_verified" boolean, "founder_handle" "text", "founder_display_name" "text", "founder_avatar_url" "text", "status" "jsonb", "stacks" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name as app_name,
        a.tagline as app_tagline,
        a.logo_url as app_logo_url,
        a.url as app_url,
        a.is_verified,
        p.username as founder_handle,
        p.name as founder_display_name,
        p.avatar_url as founder_avatar_url,
        (
            SELECT jsonb_build_object('name', st.name, 'slug', st.slug)
            FROM app_statuses st WHERE st.id = a.status_id
        ) as status,
        (
            SELECT jsonb_agg(jsonb_build_object('id', ts.id, 'name', ts.name, 'logo_url', ts.logo_url))
            FROM app_stacks ast
            JOIN tech_stacks ts ON ts.id = ast.stack_id
            WHERE ast.app_id = a.id
        ) as stacks
    FROM apps a
    JOIN profiles p ON a.user_id = p.id
    WHERE a.is_visible = true -- EL ÚNICO FILTRO REAL
    AND a.logo_url IS NOT NULL -- DEBE TENER LOGO
    ORDER BY a.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_showcase_apps"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_verified_founders"() RETURNS TABLE("display_name" "text", "username" "text", "avatar_url" "text", "tagline" "text", "city" "text", "apps_count" bigint, "social_links" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.name::text as display_name,
    p.username::text,
    p.avatar_url::text,
    p.tagline::text,
    p.location::text as city,
    COUNT(a.id) as apps_count,
    jsonb_strip_nulls(jsonb_build_object(
      'linkedin', p.linkedin,
      'twitter', p.twitter,
      'github', p.github
    )) as social_links
  FROM profiles p
  JOIN apps a ON a.user_id = p.id
  WHERE a.is_visible = true
  AND p.username IS NOT NULL
  GROUP BY p.id
  HAVING COUNT(a.id) > 0
  ORDER BY p.display_order ASC, apps_count DESC, p.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_verified_founders"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_app_like_cleanup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE type = 'app_like'
  AND actor_id = OLD.user_id
  AND resource_id = OLD.app_id
  AND read_at IS NULL;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_app_like_cleanup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_app_like_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
DECLARE
  v_app_owner_id UUID;
  v_app_name TEXT;
BEGIN
  SELECT user_id, name INTO v_app_owner_id, v_app_name FROM public.apps WHERE id = NEW.app_id;
  IF v_app_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, resource_id, resource_slug, meta)
    VALUES (
      v_app_owner_id,
      NEW.user_id,
      'app_like',
      NEW.app_id,
      '/app/' || NEW.app_id,
      jsonb_build_object('app_name', COALESCE(v_app_name, 'App'))
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_app_like_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_beta_active_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.beta_active = true THEN
      NEW.beta_updated_at = now();
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If beta is activated, update the timestamp
    IF NEW.beta_active = true AND OLD.beta_active = false THEN
      NEW.beta_updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_beta_active_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_beta_tester_accepted"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
    -- Check if it was accepted (status changed from pending/rejected to accepted)
    IF (NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted')) THEN
        -- Check if notification type is enabled
        IF (SELECT enabled FROM public.notification_configs WHERE type = 'beta_accepted') THEN
            -- We need to find the app owner to get app name for meta
            DECLARE
                v_app_name text;
            BEGIN
                SELECT name INTO v_app_name FROM public.apps WHERE id = NEW.app_id;
                
                INSERT INTO public.notifications (
                    recipient_id,
                    actor_id,
                    type,
                    resource_id,
                    meta
                ) VALUES (
                    NEW.user_id, -- recipient is the tester
                    (SELECT user_id FROM public.apps WHERE id = NEW.app_id), -- actor is app owner
                    'beta_accepted',
                    NEW.app_id,
                    jsonb_build_object('app_name', COALESCE(v_app_name, 'App'))
                );
            EXCEPTION WHEN OTHERS THEN
                -- Log error but don't stop the update
                RAISE WARNING 'Error sending beta_accepted notification: %', SQLERRM;
            END;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_beta_tester_accepted"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_feedback_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
DECLARE
    v_recipient_id uuid;
    v_actor_id uuid;
    v_app_name text;
BEGIN
    -- Only trigger on status change
    IF (NEW.status != OLD.status) THEN
        -- Check if enabled
        IF (SELECT enabled FROM public.notification_configs WHERE type = 'feedback_status') THEN
            
            SELECT name INTO v_app_name FROM public.apps WHERE id = NEW.app_id;

            -- Determine recipient and actor based on who triggered it
            -- If owner changed it, notify tester. If tester closed it, notify owner.
            -- Using auth.uid() to identify who's acting
            
            IF (auth.uid() = NEW.tester_id) THEN
                -- Tester acting (e.g., confirming resolution) -> Notify Owner
                SELECT user_id INTO v_recipient_id FROM public.apps WHERE id = NEW.app_id;
                v_actor_id := NEW.tester_id;
            ELSE
                -- Owner acting -> Notify Tester
                v_recipient_id := NEW.tester_id;
                SELECT user_id INTO v_actor_id FROM public.apps WHERE id = NEW.app_id;
            END IF;

            INSERT INTO public.notifications (
                recipient_id,
                actor_id,
                type,
                resource_id,
                resource_slug,
                meta
            ) VALUES (
                v_recipient_id,
                v_actor_id,
                'feedback_status',
                NEW.id, -- feedback_id
                NEW.app_id,
                jsonb_build_object(
                    'app_name', COALESCE(v_app_name, 'App'),
                    'new_status', NEW.status,
                    'old_status', OLD.status
                )
            );
        END IF;
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error sending feedback_status notification: %', SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_feedback_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_follow_cleanup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE type = 'follow'
  AND actor_id = OLD.follower_id
  AND recipient_id = OLD.following_id
  AND read_at IS NULL;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_follow_cleanup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_follow_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, actor_id, type)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follow'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_follow_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- 1. Extraer el username base del metadato o del email (parte local)
  base_username := COALESCE(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'preferred_username',
    split_part(new.email, '@', 1)
  );
  
  -- Fallback si el email es nulo o vacío (raro en auth.users)
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user';
  END IF;

  -- Normalizar: minúsculas y quitar caracteres especiales
  base_username := regexp_replace(lower(base_username), '[^a-z0-9]', '', 'g');
  
  -- Asegurar longitud mínima
  IF length(base_username) < 2 THEN
    base_username := base_username || 'user';
  END IF;

  final_username := base_username;

  -- 2. Resolver colisiones
  -- Buscamos si existe el username, pero EXCLUYENDO al propio usuario (por si es un update/retry)
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != new.id) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  -- 3. Sincronizar con public.profiles
  INSERT INTO public.profiles (id, name, avatar_url, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    final_username
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Sincronizamos nombre y avatar si no están presentes
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    -- El username solo se autosetea si el usuario NO tiene uno ya (evitar sobrescribir cambios manuales)
    username = COALESCE(public.profiles.username, EXCLUDED.username);

  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_feedback_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  UPDATE public.beta_testers
  SET feedback_count = feedback_count + 1
  WHERE app_id = NEW.app_id AND user_id = NEW.tester_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_feedback_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_notification_enabled"("p_type" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.notification_configs
        WHERE type = p_type AND enabled = true
    );
END;
$$;


ALTER FUNCTION "public"."is_notification_enabled"("p_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_app_columns"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  -- Check if any verification column is being changed
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified
    OR NEW.verification_token IS DISTINCT FROM OLD.verification_token
    OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
    OR NEW.verified_url IS DISTINCT FROM OLD.verified_url
  THEN
    -- Allow only service_role to modify verification columns
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'Cannot modify protected app verification columns';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."protect_app_columns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_profile_columns"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  IF NEW.member_number IS DISTINCT FROM OLD.member_number
    OR NEW.is_pioneer IS DISTINCT FROM OLD.is_pioneer
    OR NEW.is_contributor IS DISTINCT FROM OLD.is_contributor
    OR NEW.total_scrapings IS DISTINCT FROM OLD.total_scrapings
    OR NEW.display_order IS DISTINCT FROM OLD.display_order
  THEN
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'Cannot modify protected profile columns';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."protect_profile_columns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_subscription_columns"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  -- Check if any protected column is being changed
  IF NEW.tier IS DISTINCT FROM OLD.tier
    OR NEW.founder_number IS DISTINCT FROM OLD.founder_number
    OR NEW.price IS DISTINCT FROM OLD.price
    OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
    OR NEW.subscription_id IS DISTINCT FROM OLD.subscription_id
    OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
    OR NEW.current_period_end IS DISTINCT FROM OLD.current_period_end
    OR NEW.signup_source IS DISTINCT FROM OLD.signup_source
  THEN
    -- Allow only service_role (edge functions, webhooks) to modify protected columns
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'Cannot modify protected subscription columns';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."protect_subscription_columns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_app_verification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  IF OLD.url IS DISTINCT FROM NEW.url THEN
    NEW.is_verified := false;
    NEW.verified_at := NULL;
    NEW.verified_url := NULL;
    NEW.verification_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."reset_app_verification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_card_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE roadmap_cards SET likes_count = likes_count + 1 WHERE id = NEW.card_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE roadmap_cards SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.card_id;
    RETURN OLD;
  END IF;
END;
$$;


ALTER FUNCTION "public"."update_card_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_feedback_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE roadmap_feedback SET likes_count = likes_count + 1 WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE roadmap_feedback SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
END;
$$;


ALTER FUNCTION "public"."update_feedback_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_thread_last_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'auth'
    AS $$
BEGIN
  UPDATE public.feedback_threads 
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_thread_last_message"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_clicks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "visitor_id" "uuid",
    "device_fingerprint" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_clicks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_stacks" (
    "app_id" "uuid" NOT NULL,
    "stack_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_stacks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_statuses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "color" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_statuses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_toggleup_mapping" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vibecoders_app_id" "uuid" NOT NULL,
    "toggleup_project_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."app_toggleup_mapping" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."apps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "name" "text",
    "tagline" "text",
    "description" "text",
    "logo_url" "text",
    "category_id" "uuid",
    "status_id" "uuid",
    "hours_ideation" integer DEFAULT 0,
    "hours_building" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "verification_token" "text" DEFAULT "encode"("extensions"."gen_random_bytes"(16), 'hex'::"text"),
    "verified_at" timestamp with time zone,
    "verified_url" "text",
    "beta_active" boolean DEFAULT false NOT NULL,
    "beta_mode" "text" DEFAULT 'open'::"text" NOT NULL,
    "beta_limit" integer DEFAULT 10 NOT NULL,
    "beta_link" "text",
    "beta_instructions" "text",
    "screenshots" "text"[] DEFAULT '{}'::"text"[],
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "favicon_url" "text",
    "beta_updated_at" timestamp with time zone,
    "analytics_enabled" boolean DEFAULT false
);


ALTER TABLE "public"."apps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."beta_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "tester_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "rating" integer,
    "is_useful" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "resolved_by_owner" boolean DEFAULT false,
    "resolved_at" timestamp with time zone,
    "tester_response" "text",
    "tester_response_at" timestamp with time zone,
    CONSTRAINT "beta_feedback_rating_check" CHECK ((("rating" IS NULL) OR (("rating" >= 1) AND ("rating" <= 5)))),
    CONSTRAINT "beta_feedback_type_check" CHECK (("type" = ANY (ARRAY['bug'::"text", 'ux'::"text", 'feature'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."beta_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."beta_feedback_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feedback_id" "uuid" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "file_path" "text"
);


ALTER TABLE "public"."beta_feedback_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."beta_testers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "feedback_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "beta_testers_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."beta_testers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feature_flags" (
    "key" "text" NOT NULL,
    "enabled" boolean DEFAULT true,
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."feature_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feedback_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "thread_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "is_admin_reply" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read_at" timestamp with time zone
);


ALTER TABLE "public"."feedback_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback_threads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_message_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "feedback_threads_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."feedback_threads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "follows_check" CHECK (("follower_id" <> "following_id"))
);


ALTER TABLE "public"."follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."general_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."general_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_configs" (
    "type" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "enabled" boolean DEFAULT true,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notification_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "actor_id" "uuid",
    "type" "text" NOT NULL,
    "resource_id" "uuid",
    "resource_slug" "text",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "broadcast_id" "uuid",
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['app_like'::"text", 'follow'::"text", 'beta_req'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "visitor_id" "uuid",
    "device_fingerprint" "text" NOT NULL,
    "device_type" "text",
    "referrer" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profile_views" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."profiles_member_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."profiles_member_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "member_number" integer DEFAULT "nextval"('"public"."profiles_member_number_seq"'::"regclass") NOT NULL,
    "name" "text",
    "tagline" "text",
    "bio" "text",
    "location" "text",
    "website" "text",
    "avatar_url" "text",
    "twitter" "text",
    "github" "text",
    "tiktok" "text",
    "instagram" "text",
    "youtube" "text",
    "linkedin" "text",
    "email_public" "text",
    "font_family" "text" DEFAULT 'Inter'::"text",
    "primary_color" "text" DEFAULT '#3D5AFE'::"text",
    "accent_color" "text" DEFAULT '#1c1c1c'::"text",
    "card_style" "text" DEFAULT 'minimal'::"text",
    "lovable" "text",
    "banner_url" "text",
    "is_pioneer" boolean DEFAULT false NOT NULL,
    "show_pioneer_badge" boolean DEFAULT true NOT NULL,
    "avatar_position" "text" DEFAULT 'center'::"text",
    "banner_position" "text" DEFAULT 'center'::"text",
    "og_image_url" "text",
    "language" "text" DEFAULT 'es'::"text",
    "is_contributor" boolean DEFAULT false,
    "show_contributor_badge" boolean DEFAULT false,
    "total_scrapings" integer DEFAULT 0,
    "display_order" numeric DEFAULT 0,
    "booking_url" "text",
    "booking_button_text" "text" DEFAULT 'Book a call'::"text",
    "allow_analytics" boolean DEFAULT false,
    "allow_marketing" boolean DEFAULT false,
    CONSTRAINT "profiles_language_check" CHECK (("language" = ANY (ARRAY['es'::"text", 'en'::"text"]))),
    CONSTRAINT "username_format" CHECK ((("username" IS NULL) OR ("username" ~ '^[a-zA-Z0-9_]{1,20}$'::"text")))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."allow_analytics" IS 'Opt-in para análisis de uso';



COMMENT ON COLUMN "public"."profiles"."allow_marketing" IS 'Opt-in para correos de marketing';



CREATE TABLE IF NOT EXISTS "public"."prompt_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prompt_id" "uuid" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "file_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."prompt_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prompts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "tool_used" "text",
    "is_public" boolean DEFAULT false,
    "price" numeric,
    "is_for_sale" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resource_type" "public"."resource_type" DEFAULT 'chat_prompt'::"public"."resource_type",
    "intent_category" "public"."intent_category" DEFAULT 'ui_gen'::"public"."intent_category",
    "tool_compatibility" "text"[] DEFAULT ARRAY['Cursor'::"text", 'Lovable'::"text"],
    "filename" "text",
    "result_url" "text"
);


ALTER TABLE "public"."prompts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resource_likes" (
    "user_id" "uuid" NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."resource_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roadmap_card_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "card_id" "uuid" NOT NULL,
    "device_fingerprint" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roadmap_card_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roadmap_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "lane_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" "date",
    "likes_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."roadmap_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roadmap_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "linked_card_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "author_name" "text",
    "author_email" "text",
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "owner_response" "text",
    "owner_response_at" timestamp with time zone,
    "likes_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_hidden" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."roadmap_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roadmap_feedback_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feedback_id" "uuid" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" integer DEFAULT 0 NOT NULL,
    "file_path" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roadmap_feedback_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roadmap_feedback_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feedback_id" "uuid" NOT NULL,
    "device_fingerprint" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roadmap_feedback_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roadmap_lanes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" DEFAULT '#3D5AFE'::"text" NOT NULL,
    "font" "text" DEFAULT 'Inter'::"text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roadmap_lanes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roadmap_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "custom_title" "text",
    "font_family" "text" DEFAULT 'Inter'::"text",
    "favicon_url" "text",
    "is_public" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_feedback_public" boolean DEFAULT false NOT NULL,
    "feedback_auth_mode" "text" DEFAULT 'anonymous'::"text" NOT NULL,
    "default_language" "text",
    "custom_domain" "text",
    "primary_color" "text" DEFAULT '#3D5AFE'::"text",
    "primary_button_color" "text" DEFAULT '#3D5AFE'::"text",
    "primary_button_text_color" "text" DEFAULT '#FFFFFF'::"text"
);


ALTER TABLE "public"."roadmap_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scrape_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "url" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "request_payload" "jsonb",
    "user_id" "uuid",
    "user_email" "text"
);


ALTER TABLE "public"."scrape_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."showcase_gallery" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "project_title" "text" NOT NULL,
    "project_tagline" "text" NOT NULL,
    "project_url" "text" NOT NULL,
    "project_thumbnail" "text" NOT NULL,
    "author_name" "text" NOT NULL,
    "author_avatar" "text",
    "author_linkedin" "text",
    "author_twitter" "text",
    "author_website" "text",
    "display_order" numeric DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "project_logo_url" "text"
);


ALTER TABLE "public"."showcase_gallery" OWNER TO "postgres";


COMMENT ON TABLE "public"."showcase_gallery" IS 'Gallery of community projects for the Inspiration/Showcase section';



COMMENT ON COLUMN "public"."showcase_gallery"."project_logo_url" IS 'URL del logo cuadrado del proyecto (opcional)';



CREATE TABLE IF NOT EXISTS "public"."sidebar_menu_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "label_key" "text" NOT NULL,
    "path" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "section" "text" DEFAULT 'personal'::"text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "requires_waitlist" boolean DEFAULT false NOT NULL,
    "css_class" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sidebar_menu_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."survey_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "survey_id" "uuid",
    "text" "text" NOT NULL,
    "order_index" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "description" "text"
);


ALTER TABLE "public"."survey_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."survey_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "survey_id" "uuid",
    "user_id" "uuid",
    "ordered_option_ids" "uuid"[] NOT NULL,
    "comment" "text",
    "skipped" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."survey_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."surveys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question" "text" NOT NULL,
    "is_active" boolean DEFAULT false,
    "show_comment_field" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "badge_text" "text" DEFAULT 'ENCUESTA'::"text",
    "description" "text" DEFAULT 'Ordena las funcionalidades según su prioridad.'::"text"
);


ALTER TABLE "public"."surveys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_broadcasts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "image_url" "text",
    "button_text" "text",
    "button_link" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "sent_count" integer DEFAULT 0,
    "status" "public"."broadcast_status" DEFAULT 'sent'::"public"."broadcast_status",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_popup" boolean DEFAULT false,
    "auto_show" boolean DEFAULT false
);


ALTER TABLE "public"."system_broadcasts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."system_broadcasts"."is_popup" IS 'Whether the notification should be displayed as a popup/modal.';



COMMENT ON COLUMN "public"."system_broadcasts"."auto_show" IS 'Whether the popup should be shown automatically to the user upon login/entry.';



CREATE TABLE IF NOT EXISTS "public"."tech_stacks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text" NOT NULL,
    "tags" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "website_url" "text",
    "referral_url" "text",
    "referral_param" "text",
    "default_referral_code" "text"
);


ALTER TABLE "public"."tech_stacks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tools_library" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "tagline" "text" NOT NULL,
    "logo_url" "text",
    "website_url" "text" NOT NULL,
    "category" "text" NOT NULL,
    "pricing_model" "text",
    "is_featured" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "display_order" numeric DEFAULT 0 NOT NULL,
    "referral_url" "text",
    "referral_param" "text",
    "default_referral_code" "text"
);


ALTER TABLE "public"."tools_library" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "active_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_ideas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "is_done" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."user_ideas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'user'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_stack_referrals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stack_id" "uuid" NOT NULL,
    "referral_code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_stack_referrals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tier" "text" DEFAULT 'pending'::"text" NOT NULL,
    "founder_number" integer,
    "price" numeric DEFAULT 0,
    "stripe_customer_id" "text",
    "subscription_id" "text",
    "subscription_status" "text",
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "founder_welcome_seen" boolean DEFAULT false NOT NULL,
    "signup_source" "text"
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vibe_analytics_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "project_id" "uuid" NOT NULL,
    "page_path" "text",
    "referrer" "text",
    "browser_info" "jsonb",
    "user_hash" "text"
);


ALTER TABLE "public"."vibe_analytics_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."vibe_analytics_events" IS 'Table for SDK analytics events';



CREATE TABLE IF NOT EXISTS "public"."waitlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "user_agent" "text",
    "browser_name" "text",
    "browser_version" "text",
    "os_name" "text",
    "os_version" "text",
    "device_type" "text",
    "timezone" "text",
    "language" "text",
    "screen_width" integer,
    "screen_height" integer,
    "viewport_width" integer,
    "viewport_height" integer,
    "referrer" "text",
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."waitlist" OWNER TO "postgres";


ALTER TABLE ONLY "public"."app_categories"
    ADD CONSTRAINT "app_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_categories"
    ADD CONSTRAINT "app_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."app_clicks"
    ADD CONSTRAINT "app_clicks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_likes"
    ADD CONSTRAINT "app_likes_app_id_user_id_key" UNIQUE ("app_id", "user_id");



ALTER TABLE ONLY "public"."app_likes"
    ADD CONSTRAINT "app_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_stacks"
    ADD CONSTRAINT "app_stacks_pkey" PRIMARY KEY ("app_id", "stack_id");



ALTER TABLE ONLY "public"."app_statuses"
    ADD CONSTRAINT "app_statuses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_statuses"
    ADD CONSTRAINT "app_statuses_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."app_toggleup_mapping"
    ADD CONSTRAINT "app_toggleup_mapping_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_toggleup_mapping"
    ADD CONSTRAINT "app_toggleup_mapping_vibecoders_app_id_key" UNIQUE ("vibecoders_app_id");



ALTER TABLE ONLY "public"."apps"
    ADD CONSTRAINT "apps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."beta_feedback_attachments"
    ADD CONSTRAINT "beta_feedback_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."beta_feedback"
    ADD CONSTRAINT "beta_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."beta_testers"
    ADD CONSTRAINT "beta_testers_app_id_user_id_key" UNIQUE ("app_id", "user_id");



ALTER TABLE ONLY "public"."beta_testers"
    ADD CONSTRAINT "beta_testers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."feedback_attachments"
    ADD CONSTRAINT "feedback_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback_messages"
    ADD CONSTRAINT "feedback_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback_threads"
    ADD CONSTRAINT "feedback_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_following_id_key" UNIQUE ("follower_id", "following_id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."general_settings"
    ADD CONSTRAINT "general_settings_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."general_settings"
    ADD CONSTRAINT "general_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_configs"
    ADD CONSTRAINT "notification_configs_pkey" PRIMARY KEY ("type");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_views"
    ADD CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_member_number_unique" UNIQUE ("member_number");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."prompt_files"
    ADD CONSTRAINT "prompt_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resource_likes"
    ADD CONSTRAINT "resource_likes_pkey" PRIMARY KEY ("user_id", "resource_id");



ALTER TABLE ONLY "public"."roadmap_card_likes"
    ADD CONSTRAINT "roadmap_card_likes_card_id_device_fingerprint_key" UNIQUE ("card_id", "device_fingerprint");



ALTER TABLE ONLY "public"."roadmap_card_likes"
    ADD CONSTRAINT "roadmap_card_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_cards"
    ADD CONSTRAINT "roadmap_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_feedback_attachments"
    ADD CONSTRAINT "roadmap_feedback_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_feedback_likes"
    ADD CONSTRAINT "roadmap_feedback_likes_feedback_id_device_fingerprint_key" UNIQUE ("feedback_id", "device_fingerprint");



ALTER TABLE ONLY "public"."roadmap_feedback_likes"
    ADD CONSTRAINT "roadmap_feedback_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_feedback"
    ADD CONSTRAINT "roadmap_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_lanes"
    ADD CONSTRAINT "roadmap_lanes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_settings"
    ADD CONSTRAINT "roadmap_settings_app_id_key" UNIQUE ("app_id");



ALTER TABLE ONLY "public"."roadmap_settings"
    ADD CONSTRAINT "roadmap_settings_custom_domain_key" UNIQUE ("custom_domain");



ALTER TABLE ONLY "public"."roadmap_settings"
    ADD CONSTRAINT "roadmap_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scrape_logs"
    ADD CONSTRAINT "scrape_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scrape_logs"
    ADD CONSTRAINT "scrape_logs_url_key" UNIQUE ("url");



ALTER TABLE ONLY "public"."showcase_gallery"
    ADD CONSTRAINT "showcase_gallery_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sidebar_menu_items"
    ADD CONSTRAINT "sidebar_menu_items_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."sidebar_menu_items"
    ADD CONSTRAINT "sidebar_menu_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."survey_options"
    ADD CONSTRAINT "survey_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "survey_responses_survey_id_user_id_key" UNIQUE ("survey_id", "user_id");



ALTER TABLE ONLY "public"."surveys"
    ADD CONSTRAINT "surveys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_broadcasts"
    ADD CONSTRAINT "system_broadcasts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tech_stacks"
    ADD CONSTRAINT "tech_stacks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tools_library"
    ADD CONSTRAINT "tools_library_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activity_log"
    ADD CONSTRAINT "user_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activity_log"
    ADD CONSTRAINT "user_activity_log_user_id_active_date_key" UNIQUE ("user_id", "active_date");



ALTER TABLE ONLY "public"."user_ideas"
    ADD CONSTRAINT "user_ideas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."user_stack_referrals"
    ADD CONSTRAINT "user_stack_referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_stack_referrals"
    ADD CONSTRAINT "user_stack_referrals_user_id_stack_id_key" UNIQUE ("user_id", "stack_id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."vibe_analytics_events"
    ADD CONSTRAINT "vibe_analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_analytics_project_date" ON "public"."vibe_analytics_events" USING "btree" ("project_id", "created_at");



CREATE INDEX "idx_app_clicks_app_id" ON "public"."app_clicks" USING "btree" ("app_id");



CREATE INDEX "idx_app_clicks_created_at" ON "public"."app_clicks" USING "btree" ("created_at");



CREATE INDEX "idx_app_clicks_profile_id" ON "public"."app_clicks" USING "btree" ("profile_id");



CREATE INDEX "idx_app_likes_app_id" ON "public"."app_likes" USING "btree" ("app_id");



CREATE INDEX "idx_app_likes_user_id" ON "public"."app_likes" USING "btree" ("user_id");



CREATE INDEX "idx_beta_feedback_app_id" ON "public"."beta_feedback" USING "btree" ("app_id");



CREATE INDEX "idx_beta_feedback_tester_id" ON "public"."beta_feedback" USING "btree" ("tester_id");



CREATE INDEX "idx_beta_testers_app_id" ON "public"."beta_testers" USING "btree" ("app_id");



CREATE INDEX "idx_beta_testers_status" ON "public"."beta_testers" USING "btree" ("status");



CREATE INDEX "idx_beta_testers_user_id" ON "public"."beta_testers" USING "btree" ("user_id");



CREATE INDEX "idx_feedback_attachments_message_id" ON "public"."feedback_attachments" USING "btree" ("message_id");



CREATE INDEX "idx_feedback_messages_thread_id" ON "public"."feedback_messages" USING "btree" ("thread_id");



CREATE INDEX "idx_feedback_threads_last_message" ON "public"."feedback_threads" USING "btree" ("last_message_at" DESC);



CREATE INDEX "idx_feedback_threads_user_id" ON "public"."feedback_threads" USING "btree" ("user_id");



CREATE INDEX "idx_follows_follower_id" ON "public"."follows" USING "btree" ("follower_id");



CREATE INDEX "idx_follows_following_id" ON "public"."follows" USING "btree" ("following_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_read_at" ON "public"."notifications" USING "btree" ("read_at") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_notifications_recipient_id" ON "public"."notifications" USING "btree" ("recipient_id");



CREATE INDEX "idx_profile_views_created_at" ON "public"."profile_views" USING "btree" ("created_at");



CREATE INDEX "idx_profile_views_fingerprint_profile" ON "public"."profile_views" USING "btree" ("device_fingerprint", "profile_id", "created_at" DESC);



CREATE INDEX "idx_profile_views_profile_id" ON "public"."profile_views" USING "btree" ("profile_id");



CREATE INDEX "idx_roadmap_card_likes_card" ON "public"."roadmap_card_likes" USING "btree" ("card_id");



CREATE INDEX "idx_roadmap_card_likes_fp" ON "public"."roadmap_card_likes" USING "btree" ("device_fingerprint");



CREATE UNIQUE INDEX "idx_roadmap_card_likes_unique" ON "public"."roadmap_card_likes" USING "btree" ("card_id", "device_fingerprint");



CREATE INDEX "idx_roadmap_cards_app" ON "public"."roadmap_cards" USING "btree" ("app_id");



CREATE INDEX "idx_roadmap_cards_lane" ON "public"."roadmap_cards" USING "btree" ("lane_id");



CREATE INDEX "idx_roadmap_feedback_app" ON "public"."roadmap_feedback" USING "btree" ("app_id");



CREATE INDEX "idx_roadmap_feedback_likes" ON "public"."roadmap_feedback" USING "btree" ("likes_count" DESC);



CREATE INDEX "idx_roadmap_feedback_likes_fp" ON "public"."roadmap_feedback_likes" USING "btree" ("feedback_id", "device_fingerprint");



CREATE UNIQUE INDEX "idx_roadmap_feedback_likes_unique" ON "public"."roadmap_feedback_likes" USING "btree" ("feedback_id", "device_fingerprint");



CREATE INDEX "idx_roadmap_lanes_app" ON "public"."roadmap_lanes" USING "btree" ("app_id");



CREATE INDEX "idx_showcase_gallery_display_order" ON "public"."showcase_gallery" USING "btree" ("display_order");



CREATE INDEX "idx_user_activity_log_date" ON "public"."user_activity_log" USING "btree" ("active_date");



CREATE INDEX "idx_user_activity_log_user" ON "public"."user_activity_log" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "on_app_like_deleted" AFTER DELETE ON "public"."app_likes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_app_like_cleanup"();



CREATE OR REPLACE TRIGGER "on_app_like_inserted" AFTER INSERT ON "public"."app_likes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_app_like_notification"();



CREATE OR REPLACE TRIGGER "on_beta_active_change" BEFORE INSERT OR UPDATE ON "public"."apps" FOR EACH ROW EXECUTE FUNCTION "public"."handle_beta_active_change"();



CREATE OR REPLACE TRIGGER "on_feedback_insert" AFTER INSERT ON "public"."beta_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."increment_feedback_count"();



CREATE OR REPLACE TRIGGER "on_feedback_message_insert" AFTER INSERT ON "public"."feedback_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_thread_last_message"();



CREATE OR REPLACE TRIGGER "on_follow_deleted" AFTER DELETE ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."handle_follow_cleanup"();



CREATE OR REPLACE TRIGGER "on_follow_inserted" AFTER INSERT ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."handle_follow_notification"();



CREATE OR REPLACE TRIGGER "tr_beta_tester_accepted" AFTER UPDATE ON "public"."beta_testers" FOR EACH ROW EXECUTE FUNCTION "public"."handle_beta_tester_accepted"();



CREATE OR REPLACE TRIGGER "tr_feedback_status_change" AFTER UPDATE ON "public"."beta_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."handle_feedback_status_change"();



CREATE OR REPLACE TRIGGER "trg_feedback_likes_count" AFTER INSERT OR DELETE ON "public"."roadmap_feedback_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_feedback_likes_count"();



CREATE OR REPLACE TRIGGER "trg_update_card_likes_count" AFTER INSERT OR DELETE ON "public"."roadmap_card_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_card_likes_count"();



CREATE OR REPLACE TRIGGER "trigger_protect_app_columns" BEFORE UPDATE ON "public"."apps" FOR EACH ROW EXECUTE FUNCTION "public"."protect_app_columns"();



CREATE OR REPLACE TRIGGER "trigger_protect_profile_columns" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."protect_profile_columns"();



CREATE OR REPLACE TRIGGER "trigger_protect_subscription_columns" BEFORE UPDATE ON "public"."user_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."protect_subscription_columns"();



CREATE OR REPLACE TRIGGER "trigger_reset_app_verification" BEFORE UPDATE ON "public"."apps" FOR EACH ROW EXECUTE FUNCTION "public"."reset_app_verification"();



CREATE OR REPLACE TRIGGER "update_apps_updated_at" BEFORE UPDATE ON "public"."apps" FOR EACH ROW EXECUTE FUNCTION "public"."update_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "update_prompts_updated_at" BEFORE UPDATE ON "public"."prompts" FOR EACH ROW EXECUTE FUNCTION "public"."update_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "update_roadmap_cards_updated_at" BEFORE UPDATE ON "public"."roadmap_cards" FOR EACH ROW EXECUTE FUNCTION "public"."update_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "update_roadmap_feedback_updated_at" BEFORE UPDATE ON "public"."roadmap_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "update_roadmap_settings_updated_at" BEFORE UPDATE ON "public"."roadmap_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "update_user_subscriptions_updated_at" BEFORE UPDATE ON "public"."user_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_profiles_updated_at"();



ALTER TABLE ONLY "public"."app_clicks"
    ADD CONSTRAINT "app_clicks_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_clicks"
    ADD CONSTRAINT "app_clicks_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_clicks"
    ADD CONSTRAINT "app_clicks_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."app_likes"
    ADD CONSTRAINT "app_likes_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_likes"
    ADD CONSTRAINT "app_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_stacks"
    ADD CONSTRAINT "app_stacks_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_stacks"
    ADD CONSTRAINT "app_stacks_stack_id_fkey" FOREIGN KEY ("stack_id") REFERENCES "public"."tech_stacks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_toggleup_mapping"
    ADD CONSTRAINT "app_toggleup_mapping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."apps"
    ADD CONSTRAINT "apps_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."app_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."apps"
    ADD CONSTRAINT "apps_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."app_statuses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."apps"
    ADD CONSTRAINT "apps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."beta_feedback"
    ADD CONSTRAINT "beta_feedback_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."beta_feedback_attachments"
    ADD CONSTRAINT "beta_feedback_attachments_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "public"."beta_feedback"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."beta_feedback"
    ADD CONSTRAINT "beta_feedback_tester_id_fkey" FOREIGN KEY ("tester_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."beta_testers"
    ADD CONSTRAINT "beta_testers_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."beta_testers"
    ADD CONSTRAINT "beta_testers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback_attachments"
    ADD CONSTRAINT "feedback_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."feedback_messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback_messages"
    ADD CONSTRAINT "feedback_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback_messages"
    ADD CONSTRAINT "feedback_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."feedback_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback_threads"
    ADD CONSTRAINT "feedback_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "fk_survey_responses_profiles" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "public"."system_broadcasts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_views"
    ADD CONSTRAINT "profile_views_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_views"
    ADD CONSTRAINT "profile_views_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prompt_files"
    ADD CONSTRAINT "prompt_files_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resource_likes"
    ADD CONSTRAINT "resource_likes_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."prompts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resource_likes"
    ADD CONSTRAINT "resource_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_card_likes"
    ADD CONSTRAINT "roadmap_card_likes_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."roadmap_cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_cards"
    ADD CONSTRAINT "roadmap_cards_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_cards"
    ADD CONSTRAINT "roadmap_cards_lane_id_fkey" FOREIGN KEY ("lane_id") REFERENCES "public"."roadmap_lanes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_feedback"
    ADD CONSTRAINT "roadmap_feedback_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_feedback_attachments"
    ADD CONSTRAINT "roadmap_feedback_attachments_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "public"."roadmap_feedback"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_feedback_likes"
    ADD CONSTRAINT "roadmap_feedback_likes_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "public"."roadmap_feedback"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_feedback"
    ADD CONSTRAINT "roadmap_feedback_linked_card_id_fkey" FOREIGN KEY ("linked_card_id") REFERENCES "public"."roadmap_cards"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."roadmap_lanes"
    ADD CONSTRAINT "roadmap_lanes_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_settings"
    ADD CONSTRAINT "roadmap_settings_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scrape_logs"
    ADD CONSTRAINT "scrape_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."survey_options"
    ADD CONSTRAINT "survey_options_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "survey_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "survey_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."system_broadcasts"
    ADD CONSTRAINT "system_broadcasts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_activity_log"
    ADD CONSTRAINT "user_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_ideas"
    ADD CONSTRAINT "user_ideas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_stack_referrals"
    ADD CONSTRAINT "user_stack_referrals_stack_id_fkey" FOREIGN KEY ("stack_id") REFERENCES "public"."tech_stacks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_stack_referrals"
    ADD CONSTRAINT "user_stack_referrals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Accepted testers can submit feedback" ON "public"."beta_feedback" FOR INSERT WITH CHECK ((("auth"."uid"() = "tester_id") AND (EXISTS ( SELECT 1
   FROM "public"."beta_testers"
  WHERE (("beta_testers"."app_id" = "beta_feedback"."app_id") AND ("beta_testers"."user_id" = "auth"."uid"()) AND ("beta_testers"."status" = 'accepted'::"text"))))));



CREATE POLICY "Admins can delete attachments" ON "public"."feedback_attachments" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete messages" ON "public"."feedback_messages" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete settings" ON "public"."general_settings" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete showcase" ON "public"."showcase_gallery" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete survey responses" ON "public"."survey_responses" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can delete tech stacks" ON "public"."tech_stacks" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete threads" ON "public"."feedback_threads" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete tools" ON "public"."tools_library" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can do everything on system_broadcasts" ON "public"."system_broadcasts" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can insert attachments" ON "public"."feedback_attachments" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert messages" ON "public"."feedback_messages" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert settings" ON "public"."general_settings" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert showcase" ON "public"."showcase_gallery" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert tech stacks" ON "public"."tech_stacks" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert tools" ON "public"."tools_library" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage menu items" ON "public"."sidebar_menu_items" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage survey options" ON "public"."survey_options" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can manage surveys" ON "public"."surveys" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can read all notifications" ON "public"."notifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can update messages" ON "public"."feedback_messages" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update settings" ON "public"."general_settings" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update showcase" ON "public"."showcase_gallery" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update tech stacks" ON "public"."tech_stacks" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update threads" ON "public"."feedback_threads" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update tools" ON "public"."tools_library" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all activity" ON "public"."user_activity_log" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all app_clicks" ON "public"."app_clicks" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all app_stacks" ON "public"."app_stacks" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all apps" ON "public"."apps" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all attachments" ON "public"."feedback_attachments" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all messages" ON "public"."feedback_messages" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all survey responses" ON "public"."survey_responses" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can view all threads" ON "public"."feedback_threads" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins view all tools" ON "public"."tools_library" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Allow anonymous insert" ON "public"."waitlist" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anonymous select by email" ON "public"."waitlist" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow authenticated users to check their own waitlist status" ON "public"."waitlist" FOR SELECT TO "authenticated" USING (("email" = "lower"(("auth"."jwt"() ->> 'email'::"text"))));



CREATE POLICY "Allow public read access" ON "public"."feature_flags" FOR SELECT USING (true);



CREATE POLICY "Allow read for authenticated" ON "public"."notification_configs" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow update for admins" ON "public"."notification_configs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Anyone can delete own card likes" ON "public"."roadmap_card_likes" FOR DELETE USING (true);



CREATE POLICY "Anyone can delete own feedback likes" ON "public"."roadmap_feedback_likes" FOR DELETE USING (true);



CREATE POLICY "Anyone can insert card likes" ON "public"."roadmap_card_likes" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can like feedback" ON "public"."roadmap_feedback_likes" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can read card likes" ON "public"."roadmap_card_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can submit feedback" ON "public"."roadmap_feedback" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."roadmap_settings"
  WHERE (("roadmap_settings"."app_id" = "roadmap_feedback"."app_id") AND ("roadmap_settings"."is_public" = true)))));



CREATE POLICY "Anyone can view app likes" ON "public"."app_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view beta testers" ON "public"."beta_testers" FOR SELECT USING (true);



CREATE POLICY "Anyone can view categories" ON "public"."app_categories" FOR SELECT USING (true);



CREATE POLICY "Anyone can view feedback attachments" ON "public"."roadmap_feedback_attachments" FOR SELECT USING (true);



CREATE POLICY "Anyone can view feedback of public roadmaps" ON "public"."roadmap_feedback" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."roadmap_settings"
  WHERE (("roadmap_settings"."app_id" = "roadmap_feedback"."app_id") AND ("roadmap_settings"."is_public" = true)))));



CREATE POLICY "Anyone can view likes" ON "public"."roadmap_feedback_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view menu items" ON "public"."sidebar_menu_items" FOR SELECT USING (true);



CREATE POLICY "Anyone can view settings" ON "public"."general_settings" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anyone can view stacks of visible apps" ON "public"."app_stacks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "app_stacks"."app_id") AND ("apps"."is_visible" = true)))));



CREATE POLICY "Anyone can view statuses" ON "public"."app_statuses" FOR SELECT USING (true);



CREATE POLICY "Anyone can view tech stacks" ON "public"."tech_stacks" FOR SELECT USING (true);



CREATE POLICY "Anyone can view visible apps" ON "public"."apps" FOR SELECT USING (("is_visible" = true));



CREATE POLICY "App owners and testers can view feedback" ON "public"."beta_feedback" FOR SELECT USING ((("auth"."uid"() = "tester_id") OR (EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "beta_feedback"."app_id") AND ("apps"."user_id" = "auth"."uid"()))))));



CREATE POLICY "App owners can add testers" ON "public"."beta_testers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "beta_testers"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "App owners can delete feedback" ON "public"."beta_feedback" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "beta_feedback"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "App owners can insert feedback" ON "public"."beta_feedback" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "beta_feedback"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "App owners can update feedback" ON "public"."beta_feedback" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "beta_feedback"."app_id") AND ("apps"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "beta_feedback"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "App owners can update tester status" ON "public"."beta_testers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "beta_testers"."app_id") AND ("apps"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "beta_testers"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "App owners or testers can delete" ON "public"."beta_testers" FOR DELETE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "beta_testers"."app_id") AND ("apps"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Authenticated users can like apps" ON "public"."app_likes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Delete files for own prompts" ON "public"."prompt_files" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."prompts"
  WHERE (("prompts"."id" = "prompt_files"."prompt_id") AND ("prompts"."user_id" = "auth"."uid"())))));



CREATE POLICY "Follows are viewable by everyone" ON "public"."follows" FOR SELECT USING (true);



CREATE POLICY "Insert attachments for public roadmap feedback" ON "public"."roadmap_feedback_attachments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."roadmap_feedback" "rf"
     JOIN "public"."roadmap_settings" "rs" ON (("rs"."app_id" = "rf"."app_id")))
  WHERE (("rf"."id" = "roadmap_feedback_attachments"."feedback_id") AND ("rs"."is_public" = true)))));



CREATE POLICY "Insert files for own prompts" ON "public"."prompt_files" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."prompts"
  WHERE (("prompts"."id" = "prompt_files"."prompt_id") AND ("prompts"."user_id" = "auth"."uid"())))));



CREATE POLICY "Only admins can update feature flags" ON "public"."feature_flags" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only service role can insert clicks" ON "public"."app_clicks" FOR INSERT WITH CHECK (("current_setting"('request.jwt.claim.role'::"text", true) = 'service_role'::"text"));



CREATE POLICY "Only service role can insert profile views" ON "public"."profile_views" FOR INSERT WITH CHECK (("current_setting"('request.jwt.claim.role'::"text", true) = 'service_role'::"text"));



CREATE POLICY "Owners can delete feedback attachments" ON "public"."roadmap_feedback_attachments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."roadmap_feedback" "rf"
     JOIN "public"."apps" ON (("apps"."id" = "rf"."app_id")))
  WHERE (("rf"."id" = "roadmap_feedback_attachments"."feedback_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "Owners can delete own prompts" ON "public"."prompts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Owners can insert own prompts" ON "public"."prompts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Owners can manage feedback" ON "public"."roadmap_feedback" USING ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "roadmap_feedback"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "Owners can manage own cards" ON "public"."roadmap_cards" USING ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "roadmap_cards"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "Owners can manage own lanes" ON "public"."roadmap_lanes" USING ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "roadmap_lanes"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "Owners can manage own roadmap settings" ON "public"."roadmap_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "roadmap_settings"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "Owners can update own prompts" ON "public"."prompts" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Owners can view own prompts" ON "public"."prompts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Profile owners can view their app clicks" ON "public"."app_clicks" FOR SELECT USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Profile owners can view their views" ON "public"."profile_views" FOR SELECT USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Public can view active showcase projects" ON "public"."showcase_gallery" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view cards of public roadmaps" ON "public"."roadmap_cards" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."roadmap_settings"
  WHERE (("roadmap_settings"."app_id" = "roadmap_cards"."app_id") AND ("roadmap_settings"."is_public" = true)))));



CREATE POLICY "Public can view lanes of public roadmaps" ON "public"."roadmap_lanes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."roadmap_settings"
  WHERE (("roadmap_settings"."app_id" = "roadmap_lanes"."app_id") AND ("roadmap_settings"."is_public" = true)))));



CREATE POLICY "Public can view public roadmap settings" ON "public"."roadmap_settings" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Public likes are viewable by everyone." ON "public"."resource_likes" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public prompts viewable by everyone" ON "public"."prompts" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Public survey options are viewable by everyone" ON "public"."survey_options" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."surveys"
  WHERE (("surveys"."id" = "survey_options"."survey_id") AND ("surveys"."is_active" = true)))));



CREATE POLICY "Public surveys are viewable by everyone" ON "public"."surveys" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public view active tools" ON "public"."tools_library" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Service role full access" ON "public"."scrape_logs" USING (("current_setting"('request.jwt.claim.role'::"text", true) = 'service_role'::"text")) WITH CHECK (("current_setting"('request.jwt.claim.role'::"text", true) = 'service_role'::"text"));



CREATE POLICY "Testers can delete own attachments" ON "public"."beta_feedback_attachments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."beta_feedback"
  WHERE (("beta_feedback"."id" = "beta_feedback_attachments"."feedback_id") AND ("beta_feedback"."tester_id" = "auth"."uid"())))));



CREATE POLICY "Testers can insert own attachments" ON "public"."beta_feedback_attachments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."beta_feedback"
  WHERE (("beta_feedback"."id" = "beta_feedback_attachments"."feedback_id") AND ("beta_feedback"."tester_id" = "auth"."uid"())))));



CREATE POLICY "Testers can update own feedback" ON "public"."beta_feedback" FOR UPDATE USING (("auth"."uid"() = "tester_id")) WITH CHECK (("auth"."uid"() = "tester_id"));



CREATE POLICY "Users can create their own responses" ON "public"."survey_responses" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create threads" ON "public"."feedback_threads" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own apps" ON "public"."apps" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own notifications" ON "public"."notifications" FOR DELETE USING (("auth"."uid"() = "recipient_id"));



CREATE POLICY "Users can delete own referral codes" ON "public"."user_stack_referrals" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own ideas" ON "public"."user_ideas" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own likes." ON "public"."resource_likes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can follow others" ON "public"."follows" FOR INSERT WITH CHECK (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can insert attachments" ON "public"."feedback_attachments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."feedback_messages" "m"
     JOIN "public"."feedback_threads" "t" ON (("t"."id" = "m"."thread_id")))
  WHERE (("m"."id" = "feedback_attachments"."message_id") AND ("t"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert messages in own threads" ON "public"."feedback_messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."feedback_threads"
  WHERE (("feedback_threads"."id" = "feedback_messages"."thread_id") AND ("feedback_threads"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can insert own activity" ON "public"."user_activity_log" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own apps" ON "public"."apps" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert own referral codes" ON "public"."user_stack_referrals" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own subscription" ON "public"."user_subscriptions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own ideas" ON "public"."user_ideas" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own likes." ON "public"."resource_likes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can join beta" ON "public"."beta_testers" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own app stacks" ON "public"."app_stacks" USING ((EXISTS ( SELECT 1
   FROM "public"."apps"
  WHERE (("apps"."id" = "app_stacks"."app_id") AND ("apps"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can only insert own mappings" ON "public"."app_toggleup_mapping" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only see own mappings" ON "public"."app_toggleup_mapping" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can unfollow" ON "public"."follows" FOR DELETE USING (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can unlike apps" ON "public"."app_likes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own activity" ON "public"."user_activity_log" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own apps" ON "public"."apps" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "recipient_id")) WITH CHECK (("auth"."uid"() = "recipient_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own referral codes" ON "public"."user_stack_referrals" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own welcome seen" ON "public"."user_subscriptions" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own ideas" ON "public"."user_ideas" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own activity" ON "public"."user_activity_log" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own apps" ON "public"."apps" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own attachments" ON "public"."feedback_attachments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."feedback_messages" "m"
     JOIN "public"."feedback_threads" "t" ON (("t"."id" = "m"."thread_id")))
  WHERE (("m"."id" = "feedback_attachments"."message_id") AND ("t"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "recipient_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own referral codes" ON "public"."user_stack_referrals" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own subscription" ON "public"."user_subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own thread messages" ON "public"."feedback_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."feedback_threads"
  WHERE (("feedback_threads"."id" = "feedback_messages"."thread_id") AND ("feedback_threads"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own threads" ON "public"."feedback_threads" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own ideas" ON "public"."user_ideas" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own responses" ON "public"."survey_responses" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "View files of public or own prompts" ON "public"."prompt_files" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."prompts"
  WHERE (("prompts"."id" = "prompt_files"."prompt_id") AND (("prompts"."is_public" = true) OR ("prompts"."user_id" = "auth"."uid"()))))));



CREATE POLICY "View own or owned app attachments" ON "public"."beta_feedback_attachments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."beta_feedback" "bf"
     JOIN "public"."apps" ON (("apps"."id" = "bf"."app_id")))
  WHERE (("bf"."id" = "beta_feedback_attachments"."feedback_id") AND (("bf"."tester_id" = "auth"."uid"()) OR ("apps"."user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."app_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_clicks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_stacks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_statuses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_toggleup_mapping" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."apps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."beta_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."beta_feedback_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."beta_testers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feature_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback_threads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."general_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prompt_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prompts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resource_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_card_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_feedback_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_feedback_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_lanes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scrape_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."showcase_gallery" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sidebar_menu_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."survey_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."survey_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."surveys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_broadcasts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tech_stacks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tools_library" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_ideas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_stack_referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."waitlist" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."assign_founder_tier"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."assign_founder_tier"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_founder_tier"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_showcase_apps"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_showcase_apps"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_showcase_apps"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_verified_founders"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_verified_founders"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_verified_founders"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_app_like_cleanup"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_app_like_cleanup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_app_like_cleanup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_app_like_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_app_like_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_app_like_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_beta_active_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_beta_active_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_beta_active_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_beta_tester_accepted"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_beta_tester_accepted"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_beta_tester_accepted"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_feedback_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_feedback_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_feedback_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_follow_cleanup"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_follow_cleanup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_follow_cleanup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_follow_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_follow_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_follow_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_feedback_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_feedback_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_feedback_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_notification_enabled"("p_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_notification_enabled"("p_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_notification_enabled"("p_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_app_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_app_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_app_columns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_profile_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_profile_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_profile_columns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_subscription_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_subscription_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_subscription_columns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_app_verification"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_app_verification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_app_verification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_card_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_card_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_card_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_feedback_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_feedback_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_feedback_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_thread_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_thread_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_thread_last_message"() TO "service_role";


















GRANT ALL ON TABLE "public"."app_categories" TO "anon";
GRANT ALL ON TABLE "public"."app_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."app_categories" TO "service_role";
GRANT SELECT ON TABLE "public"."app_categories" TO PUBLIC;



GRANT ALL ON TABLE "public"."app_clicks" TO "anon";
GRANT ALL ON TABLE "public"."app_clicks" TO "authenticated";
GRANT ALL ON TABLE "public"."app_clicks" TO "service_role";
GRANT SELECT ON TABLE "public"."app_clicks" TO PUBLIC;



GRANT ALL ON TABLE "public"."app_likes" TO "anon";
GRANT ALL ON TABLE "public"."app_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."app_likes" TO "service_role";
GRANT SELECT ON TABLE "public"."app_likes" TO PUBLIC;



GRANT ALL ON TABLE "public"."app_stacks" TO "anon";
GRANT ALL ON TABLE "public"."app_stacks" TO "authenticated";
GRANT ALL ON TABLE "public"."app_stacks" TO "service_role";
GRANT SELECT ON TABLE "public"."app_stacks" TO PUBLIC;



GRANT ALL ON TABLE "public"."app_statuses" TO "anon";
GRANT ALL ON TABLE "public"."app_statuses" TO "authenticated";
GRANT ALL ON TABLE "public"."app_statuses" TO "service_role";
GRANT SELECT ON TABLE "public"."app_statuses" TO PUBLIC;



GRANT ALL ON TABLE "public"."app_toggleup_mapping" TO "anon";
GRANT ALL ON TABLE "public"."app_toggleup_mapping" TO "authenticated";
GRANT ALL ON TABLE "public"."app_toggleup_mapping" TO "service_role";
GRANT SELECT ON TABLE "public"."app_toggleup_mapping" TO PUBLIC;



GRANT ALL ON TABLE "public"."apps" TO "anon";
GRANT ALL ON TABLE "public"."apps" TO "authenticated";
GRANT ALL ON TABLE "public"."apps" TO "service_role";
GRANT SELECT ON TABLE "public"."apps" TO PUBLIC;



GRANT ALL ON TABLE "public"."beta_feedback" TO "anon";
GRANT ALL ON TABLE "public"."beta_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."beta_feedback" TO "service_role";
GRANT SELECT ON TABLE "public"."beta_feedback" TO PUBLIC;



GRANT ALL ON TABLE "public"."beta_feedback_attachments" TO "anon";
GRANT ALL ON TABLE "public"."beta_feedback_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."beta_feedback_attachments" TO "service_role";
GRANT SELECT ON TABLE "public"."beta_feedback_attachments" TO PUBLIC;



GRANT ALL ON TABLE "public"."beta_testers" TO "anon";
GRANT ALL ON TABLE "public"."beta_testers" TO "authenticated";
GRANT ALL ON TABLE "public"."beta_testers" TO "service_role";
GRANT SELECT ON TABLE "public"."beta_testers" TO PUBLIC;



GRANT ALL ON TABLE "public"."feature_flags" TO "anon";
GRANT ALL ON TABLE "public"."feature_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_flags" TO "service_role";
GRANT SELECT ON TABLE "public"."feature_flags" TO PUBLIC;



GRANT ALL ON TABLE "public"."feedback_attachments" TO "anon";
GRANT ALL ON TABLE "public"."feedback_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_attachments" TO "service_role";
GRANT SELECT ON TABLE "public"."feedback_attachments" TO PUBLIC;



GRANT ALL ON TABLE "public"."feedback_messages" TO "anon";
GRANT ALL ON TABLE "public"."feedback_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_messages" TO "service_role";
GRANT SELECT ON TABLE "public"."feedback_messages" TO PUBLIC;



GRANT ALL ON TABLE "public"."feedback_threads" TO "anon";
GRANT ALL ON TABLE "public"."feedback_threads" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_threads" TO "service_role";
GRANT SELECT ON TABLE "public"."feedback_threads" TO PUBLIC;



GRANT ALL ON TABLE "public"."follows" TO "anon";
GRANT ALL ON TABLE "public"."follows" TO "authenticated";
GRANT ALL ON TABLE "public"."follows" TO "service_role";
GRANT SELECT ON TABLE "public"."follows" TO PUBLIC;



GRANT ALL ON TABLE "public"."general_settings" TO "anon";
GRANT ALL ON TABLE "public"."general_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."general_settings" TO "service_role";
GRANT SELECT ON TABLE "public"."general_settings" TO PUBLIC;



GRANT ALL ON TABLE "public"."notification_configs" TO "anon";
GRANT ALL ON TABLE "public"."notification_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_configs" TO "service_role";
GRANT SELECT ON TABLE "public"."notification_configs" TO PUBLIC;



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";
GRANT SELECT ON TABLE "public"."notifications" TO PUBLIC;



GRANT ALL ON TABLE "public"."profile_views" TO "anon";
GRANT ALL ON TABLE "public"."profile_views" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_views" TO "service_role";
GRANT SELECT ON TABLE "public"."profile_views" TO PUBLIC;



GRANT ALL ON SEQUENCE "public"."profiles_member_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_member_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_member_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."profiles" TO PUBLIC;



GRANT ALL ON TABLE "public"."prompt_files" TO "anon";
GRANT ALL ON TABLE "public"."prompt_files" TO "authenticated";
GRANT ALL ON TABLE "public"."prompt_files" TO "service_role";
GRANT SELECT ON TABLE "public"."prompt_files" TO PUBLIC;



GRANT ALL ON TABLE "public"."prompts" TO "anon";
GRANT ALL ON TABLE "public"."prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."prompts" TO "service_role";
GRANT SELECT ON TABLE "public"."prompts" TO PUBLIC;



GRANT ALL ON TABLE "public"."resource_likes" TO "anon";
GRANT ALL ON TABLE "public"."resource_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."resource_likes" TO "service_role";
GRANT SELECT ON TABLE "public"."resource_likes" TO PUBLIC;



GRANT ALL ON TABLE "public"."roadmap_card_likes" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_card_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_card_likes" TO "service_role";
GRANT SELECT ON TABLE "public"."roadmap_card_likes" TO PUBLIC;



GRANT ALL ON TABLE "public"."roadmap_cards" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_cards" TO "service_role";
GRANT SELECT ON TABLE "public"."roadmap_cards" TO PUBLIC;



GRANT ALL ON TABLE "public"."roadmap_feedback" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_feedback" TO "service_role";
GRANT SELECT ON TABLE "public"."roadmap_feedback" TO PUBLIC;



GRANT ALL ON TABLE "public"."roadmap_feedback_attachments" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_feedback_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_feedback_attachments" TO "service_role";
GRANT SELECT ON TABLE "public"."roadmap_feedback_attachments" TO PUBLIC;



GRANT ALL ON TABLE "public"."roadmap_feedback_likes" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_feedback_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_feedback_likes" TO "service_role";
GRANT SELECT ON TABLE "public"."roadmap_feedback_likes" TO PUBLIC;



GRANT ALL ON TABLE "public"."roadmap_lanes" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_lanes" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_lanes" TO "service_role";
GRANT SELECT ON TABLE "public"."roadmap_lanes" TO PUBLIC;



GRANT ALL ON TABLE "public"."roadmap_settings" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_settings" TO "service_role";
GRANT SELECT ON TABLE "public"."roadmap_settings" TO PUBLIC;



GRANT ALL ON TABLE "public"."scrape_logs" TO "anon";
GRANT ALL ON TABLE "public"."scrape_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."scrape_logs" TO "service_role";
GRANT SELECT ON TABLE "public"."scrape_logs" TO PUBLIC;



GRANT ALL ON TABLE "public"."showcase_gallery" TO "anon";
GRANT ALL ON TABLE "public"."showcase_gallery" TO "authenticated";
GRANT ALL ON TABLE "public"."showcase_gallery" TO "service_role";
GRANT SELECT ON TABLE "public"."showcase_gallery" TO PUBLIC;



GRANT ALL ON TABLE "public"."sidebar_menu_items" TO "anon";
GRANT ALL ON TABLE "public"."sidebar_menu_items" TO "authenticated";
GRANT ALL ON TABLE "public"."sidebar_menu_items" TO "service_role";
GRANT SELECT ON TABLE "public"."sidebar_menu_items" TO PUBLIC;



GRANT ALL ON TABLE "public"."survey_options" TO "anon";
GRANT ALL ON TABLE "public"."survey_options" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_options" TO "service_role";
GRANT SELECT ON TABLE "public"."survey_options" TO PUBLIC;



GRANT ALL ON TABLE "public"."survey_responses" TO "anon";
GRANT ALL ON TABLE "public"."survey_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_responses" TO "service_role";
GRANT SELECT ON TABLE "public"."survey_responses" TO PUBLIC;



GRANT ALL ON TABLE "public"."surveys" TO "anon";
GRANT ALL ON TABLE "public"."surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."surveys" TO "service_role";
GRANT SELECT ON TABLE "public"."surveys" TO PUBLIC;



GRANT ALL ON TABLE "public"."system_broadcasts" TO "anon";
GRANT ALL ON TABLE "public"."system_broadcasts" TO "authenticated";
GRANT ALL ON TABLE "public"."system_broadcasts" TO "service_role";
GRANT SELECT ON TABLE "public"."system_broadcasts" TO PUBLIC;



GRANT ALL ON TABLE "public"."tech_stacks" TO "anon";
GRANT ALL ON TABLE "public"."tech_stacks" TO "authenticated";
GRANT ALL ON TABLE "public"."tech_stacks" TO "service_role";
GRANT SELECT ON TABLE "public"."tech_stacks" TO PUBLIC;



GRANT ALL ON TABLE "public"."tools_library" TO "anon";
GRANT ALL ON TABLE "public"."tools_library" TO "authenticated";
GRANT ALL ON TABLE "public"."tools_library" TO "service_role";
GRANT SELECT ON TABLE "public"."tools_library" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."user_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity_log" TO "service_role";
GRANT SELECT ON TABLE "public"."user_activity_log" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_ideas" TO "anon";
GRANT ALL ON TABLE "public"."user_ideas" TO "authenticated";
GRANT ALL ON TABLE "public"."user_ideas" TO "service_role";
GRANT SELECT ON TABLE "public"."user_ideas" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";
GRANT SELECT ON TABLE "public"."user_roles" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_stack_referrals" TO "anon";
GRANT ALL ON TABLE "public"."user_stack_referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."user_stack_referrals" TO "service_role";
GRANT SELECT ON TABLE "public"."user_stack_referrals" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";
GRANT SELECT ON TABLE "public"."user_subscriptions" TO PUBLIC;



GRANT ALL ON TABLE "public"."vibe_analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."vibe_analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."vibe_analytics_events" TO "service_role";
GRANT SELECT ON TABLE "public"."vibe_analytics_events" TO PUBLIC;



GRANT ALL ON TABLE "public"."waitlist" TO "anon";
GRANT ALL ON TABLE "public"."waitlist" TO "authenticated";
GRANT ALL ON TABLE "public"."waitlist" TO "service_role";
GRANT SELECT ON TABLE "public"."waitlist" TO PUBLIC;









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































