CREATE OR REPLACE FUNCTION public.get_verified_founders()
 RETURNS TABLE(display_name text, username text, avatar_url text, tagline text, city text, apps_count bigint, social_links jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;