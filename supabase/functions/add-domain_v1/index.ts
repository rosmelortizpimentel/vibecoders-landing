import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const VERCEL_AUTH_TOKEN = Deno.env.get('VERCEL_ACCESS_TOKEN');
    const VERCEL_PROJECT_ID = Deno.env.get('VERCEL_PROJECT_ID');
    const VERCEL_TEAM_ID = Deno.env.get('VERCEL_TEAM_ID');

    console.log(`[add-domain_v1] Debug info:`);
    console.log(`- VERCEL_PROJECT_ID: ${VERCEL_PROJECT_ID ? `${VERCEL_PROJECT_ID.substring(0, 6)}...` : 'not set'}`);
    console.log(`- VERCEL_TEAM_ID: ${VERCEL_TEAM_ID ? `${VERCEL_TEAM_ID.substring(0, 8)}...` : 'not set'}`);
    console.log(`- VERCEL_AUTH_TOKEN: ${VERCEL_AUTH_TOKEN ? 'is set' : 'not set'}`);

    if (!VERCEL_AUTH_TOKEN || !VERCEL_PROJECT_ID) {
      throw new Error('Vercel API credentials not configured');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'No authorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin client for DB checks
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user manually
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { domain, appId } = await req.json()
    if (!domain || !appId) {
        return new Response(JSON.stringify({ error: 'Domain and appId are required' }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        })
    }

    // Verify app ownership
    const { data: app, error: appError } = await adminClient
      .from('apps')
      .select('user_id')
      .eq('id', appId)
      .single();

    if (appError || !app || app.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'forbidden', message: 'You do not own this app' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[add-domain_v1] Adding domain ${domain} for app ${appId}`);

    const url = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;
    console.log(`[add-domain_v1] Request URL: ${url.replace(VERCEL_PROJECT_ID || '', 'PROJECT_ID').replace(VERCEL_TEAM_ID || '', 'TEAM_ID')}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    })

    const data = await res.json()
    console.log(`[add-domain_v1] Vercel response status: ${res.status}`);
    
    if (!res.ok) {
        console.error(`[add-domain_v1] Vercel error:`, data);
        return new Response(JSON.stringify({ error: data.error?.message || 'Error adding domain to Vercel' }), {
            status: res.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Persistence: Update the roadmap_settings table with the new domain
    console.log(`[add-domain_v1] Persisting domain ${domain} to roadmap_settings for app ${appId}`);
    const { error: dbError } = await adminClient
      .from('roadmap_settings')
      .update({ 
        custom_domain: domain,
        updated_at: new Date().toISOString()
      })
      .eq('app_id', appId);

    if (dbError) {
      console.error(`[add-domain_v1] Error persisting domain to DB:`, dbError);
      // We don't fail the whole request because the domain WAS added to Vercel, 
      // but we log it for manual intervention if needed.
    }

    return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    })
  } catch (error: any) {
    console.error('[add-domain_v1] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
