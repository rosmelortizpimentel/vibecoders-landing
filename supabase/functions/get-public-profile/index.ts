 // Force deploy: 2026-03-05-v2
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

     // Helper function to build referral URL
     function buildStackReferralUrl(
       stack: { website_url?: string | null; referral_url?: string | null; referral_param?: string | null; default_referral_code?: string | null },
       customCode?: string | null
     ): string | null {
       const code = customCode || stack.default_referral_code;
       
       if (stack.referral_url && code) {
         return stack.referral_url.replace('{code}', code);
       }
       if (stack.referral_param && code && stack.website_url) {
         try {
           const url = new URL(stack.website_url);
           url.searchParams.set(stack.referral_param, code);
           return url.toString();
         } catch {
           return stack.website_url;
         }
       }
       return stack.website_url || null;
     }
 
    // 1. Search profile by username (case-insensitive) with all public fields
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, username, member_number, is_pioneer, show_pioneer_badge,
        name, tagline, bio, location, website, banner_url, avatar_url,
        avatar_position, banner_position,
        primary_color, accent_color, font_family,
        booking_url, booking_button_text,
        lovable, twitter, github, linkedin, instagram, youtube, tiktok, email_public,
        is_contributor, show_contributor_badge
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

    // 2. Get apps where user is owner OR co-founder
    // First, get IDs of apps where user is co-founder
    const { data: foundedApps, error: founderError } = await supabaseAdmin
      .from('app_founders')
      .select('app_id')
      .eq('user_id', profile.id)

    if (founderError) {
      console.error(`[get-public-profile] Founders query error:`, founderError)
    }

    const coFoundedAppIds = (foundedApps || []).map(f => f.app_id)
    console.log(`[get-public-profile] Co-founded apps for ${username}:`, coFoundedAppIds)

    let appsQuery = supabaseAdmin
      .from('apps')
      .select(`
        id, url, name, tagline, description, logo_url, category_id, status_id, display_order, is_verified,
        hours_ideation, hours_building, screenshots, tags, beta_active, user_id,
        app_stacks(stack_id)
      `)
      .eq('is_visible', true)

    if (coFoundedAppIds.length > 0) {
      // Use quotes for UUIDs in .in() filter inside .or()
      const formattedIds = coFoundedAppIds.map(id => `"${id}"`).join(',')
      appsQuery = appsQuery.or(`user_id.eq.${profile.id},id.in.(${formattedIds})`)
    } else {
      appsQuery = appsQuery.eq('user_id', profile.id)
    }

    const { data: appsData, error: appsError } = await appsQuery
      .order('display_order', { ascending: true })

    if (appsError) {
      console.error(`[get-public-profile] Apps query error:`, appsError)
      // Continue without apps - not critical
    }

    // 3. Get statuses and stacks to resolve IDs
     const { data: statuses } = await supabaseAdmin.from('app_statuses').select('id, name, slug')
     const { data: categories } = await supabaseAdmin.from('app_categories').select('id, name, slug')
     const { data: stacks } = await supabaseAdmin.from('tech_stacks').select('id, name, logo_url, website_url, referral_url, referral_param, default_referral_code')
 
     // 5. Get user's custom referral codes
     const { data: userReferrals } = await supabaseAdmin
       .from('user_stack_referrals')
       .select('stack_id, referral_code')
       .eq('user_id', profile.id)

     // 6. Map apps with resolved status and stacks (including referral URLs)
    const apps = (appsData || []).map(app => {
      const status = app.status_id && statuses 
        ? statuses.find(s => s.id === app.status_id) 
        : null

      const appStacks = (app.app_stacks || [])
        .map((as: { stack_id: string }) => {
          const stack = stacks?.find(s => s.id === as.stack_id)
           if (!stack) return null
           
           // Check for user's custom referral code
           const userReferral = userReferrals?.find(r => r.stack_id === stack.id)
           const url = buildStackReferralUrl(stack, userReferral?.referral_code)
           
           return { 
             id: stack.id, 
             name: stack.name, 
             logo_url: stack.logo_url,
             url
           }
        })
        .filter(Boolean)
        .slice(0, 4) // Max 4 stacks per app

      return {
        id: app.id,
        url: app.url,
        name: app.name,
        tagline: app.tagline,
        description: app.description,
        logo_url: app.logo_url,
        is_verified: app.is_verified || false,
        hours_ideation: app.hours_ideation || 0,
        hours_building: app.hours_building || 0,
        screenshots: app.screenshots || [],
        tags: app.tags || [],
        beta_active: app.beta_active || false,
        status: status ? { name: status.name, slug: status.slug } : null,
        category: app.category_id && categories ? categories.find(c => c.id === app.category_id) : null,
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
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          avatar_position: profile.avatar_position || 'center',
          banner_url: profile.banner_url,
          banner_position: profile.banner_position || 'center',
          name: profile.name,
          tagline: profile.tagline,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          accent_color: profile.accent_color,
          primary_color: profile.primary_color || '#3D5AFE',
          font_family: profile.font_family,
          booking_url: profile.booking_url,
          booking_button_text: profile.booking_button_text,
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
