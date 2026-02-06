import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const appId = url.searchParams.get('app_id')

    if (!appId) {
      return new Response(
        JSON.stringify({ error: 'app_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current user from auth header (optional)
    let currentUserId: string | null = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      currentUserId = user?.id ?? null
    }

    // Fetch app with owner profile
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select(`
        *,
        owner:profiles!apps_user_id_fkey(id, username, name, avatar_url, tagline),
        category:app_categories(id, name, slug, icon),
        status:app_statuses(id, name, slug, color, icon),
        app_stacks(stack_id, tech_stacks(id, name, logo_url))
      `)
      .eq('id', appId)
      .eq('is_visible', true)
      .single()

    if (appError || !app) {
      console.error('Error fetching app:', appError)
      return new Response(
        JSON.stringify({ error: 'App not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Count accepted testers
    const { count: testersCount } = await supabase
      .from('beta_testers')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId)
      .eq('status', 'accepted')

    // Get accepted testers for Hall of Fame (limit 10)
    const { data: testers } = await supabase
      .from('beta_testers')
      .select(`
        id,
        user_id,
        joined_at,
        feedback_count,
        profile:profiles!beta_testers_user_id_fkey(id, username, name, avatar_url)
      `)
      .eq('app_id', appId)
      .eq('status', 'accepted')
      .order('joined_at', { ascending: true })
      .limit(10)

    // Get current user's tester status if authenticated
    let userTesterStatus: { status: string; id: string } | null = null
    if (currentUserId) {
      const { data: testerRecord } = await supabase
        .from('beta_testers')
        .select('id, status')
        .eq('app_id', appId)
        .eq('user_id', currentUserId)
        .single()
      
      userTesterStatus = testerRecord
    }

    // Check if current user is the owner
    const isOwner = currentUserId === app.user_id

    // Get likes count
    const { count: likesCount } = await supabase
      .from('app_likes')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId)

    // Check if current user liked the app
    let userLiked = false
    if (currentUserId) {
      const { data: likeRecord } = await supabase
        .from('app_likes')
        .select('id')
        .eq('app_id', appId)
        .eq('user_id', currentUserId)
        .single()
      userLiked = !!likeRecord
    }

    const response = {
      ...app,
      stacks: app.app_stacks?.map((s: any) => s.tech_stacks) || [],
      testers_count: testersCount || 0,
      testers: testers || [],
      user_tester_status: userTesterStatus,
      is_owner: isOwner,
      likes_count: likesCount || 0,
      user_liked: userLiked,
    }

    // Remove app_stacks from response (we transformed it to stacks)
    delete response.app_stacks

    console.log('App detail fetched:', { appId, testersCount, isOwner })

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-app-detail:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})