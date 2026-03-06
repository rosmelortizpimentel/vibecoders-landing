import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface VerifyRequest {
  app_id: string;
}

interface VerifyResponse {
  success: boolean;
  error?: string;
  message?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'unauthorized', message: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify auth
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'unauthorized', message: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { app_id }: VerifyRequest = await req.json();

    if (!app_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing_app_id', message: 'ID de app requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[verify-app-domain] User ${user.id} verifying app ${app_id}`);

    // Get app with service role to bypass RLS
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: app, error: appError } = await adminClient
      .from('apps')
      .select('id, url, verification_token, user_id')
      .eq('id', app_id)
      .single();

    if (appError || !app) {
      console.error('App not found:', appError);
      return new Response(
        JSON.stringify({ success: false, error: 'app_not_found', message: 'App no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership
    if (app.user_id !== user.id) {
      console.error('User does not own app:', user.id, app.user_id);
      return new Response(
        JSON.stringify({ success: false, error: 'forbidden', message: 'No tienes permiso para verificar esta app' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

   // Normalize URL - add https:// if missing
   let fetchUrl = app.url.trim();
   if (!fetchUrl.startsWith('http://') && !fetchUrl.startsWith('https://')) {
     fetchUrl = `https://${fetchUrl}`;
   }

   // Fetch the website with timeout
   console.log(`[verify-app-domain] Fetching ${fetchUrl}`);
   
   let html: string;
   try {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
     
     const response = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'VibeCoders-Verification-Bot/1.0',
          'Accept': 'text/html',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('Fetch failed with status:', response.status);
         return new Response(
           JSON.stringify({ 
             success: false, 
             error: 'fetch_failed', 
             message: `No pudimos acceder a ${fetchUrl} (status: ${response.status})` 
           }),
           { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      html = await response.text();
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
       return new Response(
         JSON.stringify({ 
           success: false, 
           error: isTimeout ? 'timeout' : 'fetch_error', 
           message: isTimeout 
             ? `El sitio ${fetchUrl} no responde (timeout)` 
             : `No pudimos acceder a ${fetchUrl}` 
         }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look for the meta tag
    // Match: <meta name="vibecoders-verify" content="TOKEN" />
    const metaRegex = /<meta\s+name=["']vibecoders-verify["']\s+content=["']([^"']+)["']\s*\/?>/i;
    const altRegex = /<meta\s+content=["']([^"']+)["']\s+name=["']vibecoders-verify["']\s*\/?>/i;
    
    const match = html.match(metaRegex) || html.match(altRegex);
    
    if (!match) {
      console.log('[verify-app-domain] Meta tag not found in HTML');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'meta_not_found', 
           message: `No encontramos la etiqueta meta en ${new URL(fetchUrl).hostname}. Asegúrate de haber desplegado los cambios.` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const foundToken = match[1];
    console.log(`[verify-app-domain] Found token: ${foundToken.substring(0, 8)}...`);

    // Verify token matches
    if (foundToken !== app.verification_token) {
      console.log('[verify-app-domain] Token mismatch');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'token_mismatch', 
          message: 'El token encontrado no coincide. Asegúrate de usar el token correcto.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success! Update the app
    console.log('[verify-app-domain] Token verified! Updating app...');
    
    const { error: updateError } = await adminClient
      .from('apps')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_url: fetchUrl,
      })
      .eq('id', app_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'update_failed', 
          message: 'Error al actualizar la verificación en la base de datos' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[verify-app-domain] Verification complete!');
    
    const result: VerifyResponse = { 
      success: true, 
      message: '¡Dominio verificado correctamente!' 
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[verify-app-domain] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'internal_error', 
        message: error instanceof Error ? `Error interno: ${error.message}` : `Error: ${String(error)}` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});