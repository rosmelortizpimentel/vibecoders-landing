import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { hostname, slugToSearch } = await req.json()
    const origin = req.headers.get('origin') || ''
    const referer = req.headers.get('referer') || ''

    console.log(`Processing request for hostname: ${hostname}, slug: ${slugToSearch}, Origin: ${origin}`)

    // 1. Identify the App and Roadmap Settings
    let appData = null
    let settingsData = null

    if (hostname && !hostname.includes('localhost') && !hostname.includes('vibecoders.la')) {
      // Search by custom domain
      const { data: settings, error: sErr } = await supabaseClient
        .from('roadmap_settings')
        .select(`*, apps(*)`)
        .eq('custom_domain', hostname)
        .maybeSingle()

      if (sErr) throw sErr
      if (settings) {
        settingsData = settings
        appData = settings.apps
      }
    }

    if (!appData && slugToSearch) {
      // Search by slug/handle
      const { data: apps, error: aErr } = await supabaseClient
        .from('apps')
        .select('*')
        .eq('slug', slugToSearch)
        .maybeSingle()

      if (aErr) throw aErr
      if (apps) {
        appData = apps
        const { data: settings, error: sErr } = await supabaseClient
          .from('roadmap_settings')
          .select('*')
          .eq('app_id', apps.id)
          .maybeSingle()
        if (sErr) throw sErr
        settingsData = settings
      }
    }

    if (!appData || !settingsData) {
      return new Response(JSON.stringify({ error: 'Roadmap not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Security Validation: Origin/Referer check
    const allowedDomains = [
      'localhost',
      'vibecoders.la',
      'vibecoders-hub.vercel.app',
      settingsData.custom_domain
    ].filter(Boolean)

    const isMatch = allowedDomains.some(domain => 
      origin.includes(domain!) || referer.includes(domain!)
    )

    if (!isMatch && !hostname.includes('localhost')) {
      console.error(`Security violation: Request from ${origin} / ${referer} not allowed for roadmap ${appData.name}`)
      return new Response(JSON.stringify({ error: 'Unauthorized origin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Fetch consolidated data
    const appId = appData.id
    const [lanes, cards, feedback] = await Promise.all([
      supabaseClient.from('roadmap_lanes').select('*').eq('app_id', appId).order('display_order'),
      supabaseClient.from('roadmap_cards').select('*').eq('app_id', appId).order('display_order'),
      supabaseClient.from('roadmap_feedback').select('*, roadmap_feedback_attachments(*)').eq('app_id', appId).order('likes_count', { ascending: false })
    ])

    return new Response(
      JSON.stringify({
        app: appData,
        settings: settingsData,
        lanes: lanes.data || [],
        cards: cards.data || [],
        feedback: (feedback.data || []).map(f => ({
          ...f,
          attachments: f.roadmap_feedback_attachments || [],
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
