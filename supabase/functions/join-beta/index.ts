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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { app_id } = await req.json()

    if (!app_id) {
      return new Response(
        JSON.stringify({ error: 'app_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get app info
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('id, name, user_id, beta_active, beta_mode, beta_limit')
      .eq('id', app_id)
      .single()

    if (appError || !app) {
      return new Response(
        JSON.stringify({ error: 'App not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify beta is active
    if (!app.beta_active) {
      return new Response(
        JSON.stringify({ error: 'Beta is not active for this app' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cannot join your own app's beta
    if (app.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot join your own beta' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already joined
    const { data: existingTester } = await supabase
      .from('beta_testers')
      .select('id, status')
      .eq('app_id', app_id)
      .eq('user_id', user.id)
      .single()

    if (existingTester) {
      return new Response(
        JSON.stringify({ 
          error: 'Already joined', 
          status: existingTester.status 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Count current accepted testers
    const { count: currentCount } = await supabase
      .from('beta_testers')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', app_id)
      .eq('status', 'accepted')

    // Check if there's room (only for open mode where auto-accept happens)
    if (app.beta_mode === 'open' && (currentCount || 0) >= app.beta_limit) {
      return new Response(
        JSON.stringify({ error: 'Squad is full' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine status based on mode
    const status = app.beta_mode === 'open' ? 'accepted' : 'pending'

    // Create tester record
    const { data: tester, error: insertError } = await supabase
      .from('beta_testers')
      .insert({
        app_id,
        user_id: user.id,
        status,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting tester:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to join beta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User joined beta:', { app_id, user_id: user.id, status })

    // ADD NOTIFICATION LOGIC
    try {
      // Check if notification is enabled
      const { data: config } = await supabase
        .from('notification_configs')
        .select('enabled')
        .eq('type', 'beta_req')
        .single();
      
      if (config?.enabled !== false) {
        await supabase
          .from('notifications')
          .insert({
            recipient_id: app.user_id,
            actor_id: user.id,
            type: 'beta_req',
            resource_id: app_id,
            resource_slug: '/me?tab=beta',
            meta: { 
              app_name: app.name || 'App',
              status: status 
            }
          });
      }
    } catch (notifErr) {
      console.error('Non-critical error sending notification:', notifErr);
    }

    return new Response(
      JSON.stringify({ success: true, status, tester }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in join-beta:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})