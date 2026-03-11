import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { isSafeUrl } from "../_shared/url-validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface ScrapeRequest {
  app_id: string;
}

/**
 * Downloads an image from a URL and uploads it to Supabase Storage
 */
async function uploadFromUrl(supabase: any, bucket: string, path: string, url: string) {
  try {
    // SSRF Protection: Validate URL before fetching
    if (!isSafeUrl(url)) {
      console.error(`[uploadFromUrl] Blocked unsafe/internal URL: ${url}`);
      return null;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, { 
        contentType,
        upsert: true 
      });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return publicUrl;
  } catch (error) {
    console.error(`[uploadFromUrl] Error uploading ${url}:`, error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'unauthorized', message: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with service role for database/storage updates
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Create client with user auth to verify identity
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Manually verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'unauthorized', message: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { app_id }: ScrapeRequest = await req.json();
    if (!app_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing_app_id', message: 'ID de app requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch app URL
    const { data: app, error: appError } = await adminClient
      .from('apps')
      .select('url, user_id')
      .eq('id', app_id)
      .single();

    if (appError || !app) {
      return new Response(
        JSON.stringify({ success: false, error: 'app_not_found', message: 'App no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership
    if (app.user_id !== user.id) {
       return new Response(
        JSON.stringify({ success: false, error: 'forbidden', message: 'No tienes permiso' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize URL
    let url = app.url.trim().toLowerCase();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    console.log(`[scrape-app-details] Processing URL: ${url}`);

    // Check cache in scrape_logs
    const { data: cachedLog, error: cacheError } = await adminClient
      .from('scrape_logs')
      .select('data')
      .eq('url', url)
      .maybeSingle();

    let scrapData;
    if (!cacheError && cachedLog) {
      console.log(`[scrape-app-details] Cache hit for ${url}`);
      scrapData = cachedLog.data;
    } else {
      console.log(`[scrape-app-details] Cache miss for ${url}. Calling Firecrawl...`);
      
      const firecrawlPayload = {
        url: url,
        onlyMainContent: false,
        maxAge: 172800000,
        parsers: ["pdf"],
        formats: [
          "screenshot",
          {
            type: "json",
            schema: {
              type: "object",
              properties: {
                page_name: { type: "string" },
                branding: { 
                  type: "object",
                  properties: {
                    logo: { type: "string" },
                    colors: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          }
        ]
      };

      if (!firecrawlKey) {
        throw new Error('FIRECRAWL_API_KEY not configured');
      }

      // Call Firecrawl
      const firecrawlResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(firecrawlPayload)
      });

      if (!firecrawlResponse.ok) {
        const errorText = await firecrawlResponse.text();
        console.error('Firecrawl error:', errorText);
        throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
      }

      const result = await firecrawlResponse.json();
      scrapData = result.data || result;

      // Save to cache with enhanced logging
      await adminClient.from('scrape_logs').upsert({
        url: url,
        data: scrapData,
        request_payload: firecrawlPayload,
        user_id: user.id,
        user_email: user.email
      });
    }

    // Map data
    const updates: Record<string, any> = {};
    if (scrapData.json?.page_name) updates.name = scrapData.json.page_name;
    
    // Tagline from metadata.title
    if (scrapData.metadata?.title) updates.tagline = scrapData.metadata.title;
    
    // Description from metadata.description
    if (scrapData.metadata?.description) updates.description = scrapData.metadata.description;

    // Handle favicon extraction and upload
    const faviconSource = scrapData.metadata?.favicon;
    if (faviconSource) {
      console.log(`[scrape-app-details] Processing favicon: ${faviconSource}`);
      let faviconUrl = faviconSource;
      // If relative URL, make absolute
      if (faviconUrl.startsWith('/')) {
        try {
          const parsedUrl = new URL(url);
          faviconUrl = `${parsedUrl.origin}${faviconUrl}`;
        } catch {}
      }
      const faviconExt = faviconUrl.split('.').pop()?.split('?')[0] || 'ico';
      const faviconPath = `${user.id}/apps/${app_id}/favicon.${faviconExt}`;
      const uploadedFaviconUrl = await uploadFromUrl(adminClient, 'profile-assets', faviconPath, faviconUrl);
      if (uploadedFaviconUrl) updates.favicon_url = uploadedFaviconUrl;
    }

    // Handle logo upload from branding.logo
    const logoSource = scrapData.json?.branding?.logo;
    if (logoSource) {
      console.log(`[scrape-app-details] Processing logo: ${logoSource}`);
      const fileExt = logoSource.split('.').pop()?.split('?')[0] || 'png';
      const logoPath = `${user.id}/apps/${app_id}/logo.${fileExt}`;
      const logoUrl = await uploadFromUrl(adminClient, 'profile-assets', logoPath, logoSource);
      if (logoUrl) updates.logo_url = logoUrl;
    }

    // Handle screenshot upload
    const screenshotSource = scrapData.screenshot || scrapData.metadata?.ogImage || scrapData.metadata?.["og:image"];
    if (screenshotSource) {
      console.log(`[scrape-app-details] Processing screenshot: ${screenshotSource}`);
      const timestamp = Date.now();
      const screenshotPath = `${user.id}/apps/${app_id}/screenshots/${timestamp}.png`;
      const screenshotUrl = await uploadFromUrl(adminClient, 'profile-assets', screenshotPath, screenshotSource);
      if (screenshotUrl) updates.screenshots = [screenshotUrl];
    }

    console.log('[scrape-app-details] Updating app with:', updates);

    // Update the app
    const { error: updateError } = await adminClient
      .from('apps')
      .update(updates)
      .eq('id', app_id);

    if (updateError) throw updateError;

    // Increment profile counter
    const { data: profile } = await adminClient.from('profiles').select('total_scrapings').eq('id', user.id).single();
    await adminClient.from('profiles').update({ total_scrapings: (profile?.total_scrapings || 0) + 1 }).eq('id', user.id);

    return new Response(
      JSON.stringify({ success: true, data: updates }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[scrape-app-details] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
