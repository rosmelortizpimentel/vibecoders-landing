// Force deploy: 2026-02-01
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get username from query string
    const url = new URL(req.url)
    const username = url.searchParams.get('username')

    console.log(`[get-public-profile] Request for username: ${username}`)

    // Validate input - only alphanumeric and underscore, max 20 chars
    if (!username || !/^[a-zA-Z0-9_]{1,20}$/.test(username)) {
      console.log(`[get-public-profile] Invalid username format: ${username}`)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid username' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create admin client with service_role (full access)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Search profile by username (case-insensitive) with all public fields
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, username, member_number, is_pioneer, show_pioneer_badge,
        name, tagline, location, website, banner_url, avatar_url,
        accent_color, font_family,
        lovable, twitter, github, linkedin, instagram, youtube, tiktok, email_public
      `)
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (profileError) {
      console.error(`[get-public-profile] Profile query error:`, profileError)
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!profile) {
      console.log(`[get-public-profile] Profile not found for username: ${username}`)
      return new Response(
        JSON.stringify({ success: false, error: 'Profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`[get-public-profile] Found profile with id: ${profile.id}`)

    // 2. Get visible apps for this user
    const { data: appsData, error: appsError } = await supabaseAdmin
      .from('apps')
      .select(`
        id, url, name, tagline, logo_url, status_id, display_order,
        app_stacks(stack_id)
      `)
      .eq('user_id', profile.id)
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
      .limit(6)

    if (appsError) {
      console.error(`[get-public-profile] Apps query error:`, appsError)
      // Continue without apps - not critical
    }

    // 3. Get statuses and stacks to resolve IDs
    const { data: statuses } = await supabaseAdmin.from('app_statuses').select('id, name, slug')
    const { data: stacks } = await supabaseAdmin.from('tech_stacks').select('id, name, logo_url')

    // 4. Map apps with resolved status and stacks
    const apps = (appsData || []).map(app => {
      const status = app.status_id && statuses 
        ? statuses.find(s => s.id === app.status_id) 
        : null

      const appStacks = (app.app_stacks || [])
        .map((as: { stack_id: string }) => {
          const stack = stacks?.find(s => s.id === as.stack_id)
          return stack ? { id: stack.id, name: stack.name, logo_url: stack.logo_url } : null
        })
        .filter(Boolean)
        .slice(0, 4) // Max 4 stacks per app

      return {
        id: app.id,
        url: app.url,
        name: app.name,
        tagline: app.tagline,
        logo_url: app.logo_url,
        status: status ? { name: status.name, slug: status.slug } : null,
        stacks: appStacks
      }
    })

    console.log(`[get-public-profile] Returning profile with ${apps.length} apps`)

    // 5. Return safe response (NO email, NO sensitive data)
    // Add 11 to member_number to make it look less empty at the start
    const displayMemberNumber = (profile.member_number || 1) + 11

    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          username: profile.username,
          avatar_url: profile.avatar_url,
          banner_url: profile.banner_url,
          name: profile.name,
          tagline: profile.tagline,
          location: profile.location,
          website: profile.website,
          accent_color: profile.accent_color,
          font_family: profile.font_family,
          member_number: displayMemberNumber,
          is_pioneer: profile.is_pioneer || false,
          show_pioneer_badge: profile.show_pioneer_badge ?? true,
          // Socials
          lovable: profile.lovable,
          twitter: profile.twitter,
          github: profile.github,
          linkedin: profile.linkedin,
          instagram: profile.instagram,
          youtube: profile.youtube,
          tiktok: profile.tiktok,
          email_public: profile.email_public,
          // Apps
          apps
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error(`[get-public-profile] Unexpected error:`, error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
