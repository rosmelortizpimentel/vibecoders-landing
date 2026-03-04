import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to slugify name
const slugify = (text: string) => 
  (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { hostname, slugToSearch, username, fingerprint } = await req.json()
    const origin = req.headers.get('origin') || ''
    const referer = req.headers.get('referer') || ''

    console.log(`Processing request for hostname: ${hostname}, slug: ${slugToSearch}, User: ${username}, Fingerprint: ${fingerprint}`)

    let appData = null
    let settingsData = null

    // 1. Identify by Custom Domain
    if (hostname && !hostname.includes('localhost') && !hostname.includes('vibecoders.la')) {
      const { data: settings, error: sErr } = await supabaseClient
        .from('roadmap_settings')
        .select(`*, apps(*)`)
        .eq('custom_domain', hostname)
        .maybeSingle()

      if (sErr) throw sErr
      if (settings && settings.apps) {
        settingsData = settings
        appData = settings.apps
      }
    }

    // 2. Identify by Slug/Handle
    if (!appData && slugToSearch) {
      let query = supabaseClient.from('apps').select('*').eq('is_visible', true)
      
      if (username) {
        const { data: profile } = await supabaseClient.from('profiles').select('id').eq('username', username).maybeSingle()
        if (profile) {
          query = query.eq('user_id', profile.id)
        }
      }

      const { data: apps, error: aErr } = await query
      if (aErr) throw aErr

      const found = apps?.find(a => slugify(a.name) === slugToSearch)
      if (found) {
        appData = found
        const { data: settings, error: sErr } = await supabaseClient
          .from('roadmap_settings')
          .select('*')
          .eq('app_id', found.id)
          .maybeSingle()
        if (sErr) throw sErr
        settingsData = settings
      }
    }

    if (!appData || !settingsData) {
      return new Response(JSON.stringify({ error: 'Roadmap not found or not public' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Security Validation
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
      console.log(`Security violation: Origin: ${origin}, Referer: ${referer}, Allowed: ${allowedDomains.join(', ')}`)
      return new Response(JSON.stringify({ error: 'Unauthorized origin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Fetch consolidated data
    const appId = appData.id
    
    const [lanes, cards, feedback] = await Promise.all([
      supabaseClient.from('roadmap_lanes').select('*').eq('app_id', appId).order('display_order'),
      supabaseClient.from('roadmap_cards').select('*').eq('app_id', appId).order('display_order'),
      supabaseClient.from('roadmap_feedback').select(`
        *,
        roadmap_feedback_attachments(*),
        author:author_id(username, avatar_url)
      `).eq('app_id', appId).eq('is_hidden', false).order('likes_count', { ascending: false })
    ])

    console.log(`Found ${feedback.data?.length} feedback items. First item author: ${JSON.stringify(feedback.data?.[0]?.author || 'N/A')}`)

    // Optional: Fetch user likes if fingerprint provided
    let likedCardIds = []
    let likedFeedbackIds = []

    if (fingerprint) {
      const [cardLikes, feedbackLikes] = await Promise.all([
        supabaseClient.from('roadmap_card_likes').select('card_id').eq('device_fingerprint', fingerprint),
        supabaseClient.from('roadmap_feedback_likes').select('feedback_id').eq('device_fingerprint', fingerprint)
      ])
      
      likedCardIds = cardLikes.data?.map(l => l.card_id) || []
      likedFeedbackIds = feedbackLikes.data?.map(l => l.feedback_id) || []
    }

    return new Response(
      JSON.stringify({
        app: appData,
        settings: settingsData,
        lanes: lanes.data || [],
        cards: cards.data || [],
        feedback: (feedback.data || []).map((f: any) => ({
          ...f,
          attachments: f.roadmap_feedback_attachments || [],
          author_username: f.author?.username || null,
          author_avatar_url: f.author?.avatar_url || null,
        })),
        userLikes: {
          cards: likedCardIds,
          feedback: likedFeedbackIds
        }
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
