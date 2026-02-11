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

    const { app_id, type, content, rating, attachments } = await req.json()

    // Validate required fields
    if (!app_id || !type || !content) {
      return new Response(
        JSON.stringify({ error: 'app_id, type, and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate type
    const validTypes = ['bug', 'ux', 'feature', 'other']
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return new Response(
          JSON.stringify({ error: 'Rating must be between 1 and 5' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Validate attachments if provided
    if (attachments && Array.isArray(attachments)) {
      if (attachments.length > 10) {
        return new Response(
          JSON.stringify({ error: 'Maximum 10 attachments allowed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Verify user is an accepted tester
    const { data: tester, error: testerError } = await supabase
      .from('beta_testers')
      .select('id, status')
      .eq('app_id', app_id)
      .eq('user_id', user.id)
      .single()

    if (testerError || !tester) {
      return new Response(
        JSON.stringify({ error: 'Not a beta tester for this app' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (tester.status !== 'accepted') {
      return new Response(
        JSON.stringify({ error: 'Tester status is not accepted' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert feedback
    const { data: feedback, error: insertError } = await supabase
      .from('beta_feedback')
      .insert({
        app_id,
        tester_id: user.id,
        type,
        content,
        rating: rating || null,
        status: 'open',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting feedback:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to submit feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert attachments if provided
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const attachmentRecords = attachments.map((att: { url: string; name: string; type: string }) => ({
        feedback_id: feedback.id,
        file_url: att.url,
        file_name: att.name,
        file_type: att.type,
      }))

      const { error: attachError } = await supabase
        .from('beta_feedback_attachments')
        .insert(attachmentRecords)

      if (attachError) {
        console.error('Error inserting attachments:', attachError)
        // Don't fail the whole request, just log
      }
    }

    // Note: feedback_count is updated by database trigger

    // ADD NOTIFICATION LOGIC
    try {
      // Get app owner
      const { data: appData } = await supabase
        .from('apps')
        .select('user_id, name')
        .eq('id', app_id)
        .single();

      if (appData) {
        const { data: config } = await supabase
          .from('notification_configs')
          .select('enabled')
          .eq('type', 'beta_feedback')
          .single();

        if (config?.enabled !== false) {
          await supabase
            .from('notifications')
            .insert({
              recipient_id: appData.user_id,
              actor_id: user.id,
              type: 'beta_feedback',
              resource_id: feedback.id,
              resource_slug: app_id,
              meta: {
                app_name: appData.name || 'App',
                feedback_type: type
              }
            });
        }
      }
    } catch (notifErr) {
      console.error('Non-critical error sending feedback notification:', notifErr);
    }

    console.log('Feedback submitted:', { app_id, tester_id: user.id, type, attachments_count: attachments?.length || 0 })

    return new Response(
      JSON.stringify({ success: true, feedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in submit-beta-feedback:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})