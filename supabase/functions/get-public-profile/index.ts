// Force deploy: 2026-01-30
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

    // 1. Search profile by username (case-insensitive)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, member_number')
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

    // 2. Get user data from auth.users (only possible with service_role)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id)

    if (userError || !userData?.user) {
      console.error(`[get-public-profile] User fetch error:`, userError)
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const user = userData.user

    // 3. Extract ONLY safe data - NEVER include email or sensitive info
    const fullName = user.user_metadata?.full_name || ''
    const firstName = fullName.split(' ')[0] || 'Vibecoder'
    const avatarUrl = user.user_metadata?.avatar_url || null

    console.log(`[get-public-profile] Returning safe profile data for: ${profile.username}`)

    // 4. Return safe response (NO email, NO sensitive data)
    // Add 11 to member_number to make it look less empty at the start
    const displayMemberNumber = (profile.member_number || 1) + 11

    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          username: profile.username,
          avatar_url: avatarUrl,
          first_name: firstName,
          member_number: displayMemberNumber
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
