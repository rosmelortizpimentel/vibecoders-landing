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

    console.log(`[verify-domain_v1] Debug info:`);
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

    console.log(`[verify-domain_v1] Checking domain status for: ${domain}`);

    // 1. Get Domain Config (A/CNAME status)
    const configUrl = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}/config${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;
    let configRes = await fetch(configUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${VERCEL_AUTH_TOKEN}` },
    })
    let configData = await configRes.json()
    console.log(`[verify-domain_v1] Config fetched (Status ${configRes.status})`);

    // 2. Get Domain Details (Verification status)
    const verifyUrl = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;
    let verifyRes = await fetch(verifyUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${VERCEL_AUTH_TOKEN}` },
    });
    let verifyData = await verifyRes.json();
    console.log(`[verify-domain_v1] Verification details fetched (Status ${verifyRes.status})`);

    // Auto-add logic: if the domain is in our local DB but was never assigned to Vercel
    // (e.g. added while user was on a Free plan), Vercel will return 404 or "not assigned".
    const isNotAssigned = verifyRes.status === 404 || (verifyData.error?.message?.toLowerCase().includes('not assigned'));
    
    if (isNotAssigned) {
      console.log(`[verify-domain_v1] Domain not assigned in Vercel. Auto-adding it now...`);
      const addUrl = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;
      const addRes = await fetch(addUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      });

      if (addRes.ok) {
        console.log(`[verify-domain_v1] Successfully auto-added domain to Vercel. Re-fetching details...`);
        // Re-fetch since it's now added
        configRes = await fetch(configUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${VERCEL_AUTH_TOKEN}` } });
        configData = await configRes.json();
        
        verifyRes = await fetch(verifyUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${VERCEL_AUTH_TOKEN}` } });
        verifyData = await verifyRes.json();
      } else {
        const addErrData = await addRes.json();
        console.error(`[verify-domain_v1] Failed to auto-add domain to Vercel:`, addErrData);
        // We'll proceed so the frontend can receive the error
      }
    }

    // We return 200 even if Vercel says it's not verified, 
    // unless the API request itself failed fundamentally (e.g. 401/403)
    if (configRes.status === 401 || configRes.status === 403) {
      return new Response(JSON.stringify({ error: 'Vercel API authentication failed' }), {
        status: configRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
        success: true, 
        config: configData, 
        status: verifyData,
        // Helper flag for frontend
        verified: verifyData.verified === true,
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    })
  } catch (error: any) {
    console.error('[verify-domain_v1] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
