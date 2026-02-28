import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import UAParser from "https://esm.sh/ua-parser-js@1.0.35";

serve(async (req) => {
  const origin = req.headers.get("Origin") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const data = await req.json();
    const { 
      project_id, 
      event_type = "pageview",
      page_path, 
      url,
      referrer, 
      visitor_id,
      session_id,
      marketing_params,
      screen_width,
      language,
      timezone,
      extra_data
    } = data;

    // Validate origin against apps table
    const reqOrigin = req.headers.get("origin") || req.headers.get("referer") || "";
    
    // Check if app exists and origin matches
    const { data: appData, error: appError } = await supabaseClient
      .schema("public")
      .from("apps")
      .select("url, verified_url")
      .eq("id", project_id)
      .single();

    if (appError || !appData) {
      console.error("App not found or error:", appError);
      return new Response(JSON.stringify({ error: "Unauthorized or Invalid App ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Basic origin check: ensure the request origin matches the registered url or verified_url
    // We do a loose check if the origin is part of the registered URL to handle http/https/www differences
    const registeredUrl = (appData.verified_url || appData.url || "").toLowerCase();
    const currentOrigin = reqOrigin.toLowerCase();
    
    // Clean URLs for comparison (remove protocol and trailing slash)
    const cleanRegisteredUrl = registeredUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const cleanCurrentOrigin = currentOrigin.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Only block if we have a registered URL and the origin doesn't match it at all
    // If testing locally (localhost), you might want to bypass or allow this
    if (cleanRegisteredUrl && cleanCurrentOrigin && !cleanRegisteredUrl.includes(cleanCurrentOrigin) && !cleanCurrentOrigin.includes(cleanRegisteredUrl) && !cleanCurrentOrigin.includes("localhost")) {
      console.error(`Origin mismatch: ${currentOrigin} vs ${registeredUrl}`);
      return new Response(JSON.stringify({ error: "Origin not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // 1. Get IP to anonymize (using common forwarded headers or fallback)
    const forwardedFor = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "0.0.0.0";
    const ip = forwardedFor.split(',')[0].trim();
    
    // 2. Extract Technology from User-Agent (we need it early for the hash)
    const userAgent = req.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";
    const deviceType = parser.getDevice().type || (os === "iOS" || os === "Android" ? "mobile" : "desktop"); 

    // 3. Create a unique hash for the visitor (IP + User Agent combination)
    // This allows differentiating multiple devices on the same Wi-Fi network
    const hashInput = `${ip}-${userAgent}`;
    const encoder = new TextEncoder();
    const dataEncoder = encoder.encode(hashInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataEncoder);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const user_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

    // 4. Extract Geo Location from headers or external API
    let country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "";
    let region = req.headers.get("x-vercel-ip-country-region") || req.headers.get("cf-region") || "";
    let city = req.headers.get("x-vercel-ip-city") || req.headers.get("cf-ipcity") || ""; 

    // Fallback: If no headers provided by proxy/CDN, guess from IP
    if (!country && ip && ip !== "0.0.0.0" && ip !== "127.0.0.1" && !ip.startsWith("192.168.")) {
      try {
        const geoResponse = await fetch(`https://freeipapi.com/api/json/${ip}`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          country = geoData.countryName || "";
          region = geoData.regionName || "";
          city = geoData.cityName || "";
        }
      } catch (err) {
        console.error("Geo API fallback failed", err);
      }
    }

    country = country || "Unknown";
    region = region || "Unknown";
    city = city || "Unknown";

    // 5. Insert into DB
    const { error } = await supabaseClient
      .from("vibe_analytics_events")
      .insert({
        project_id,
        page_path,
        referrer,
        browser_info: { 
          screen_width,
          country,
          region,
          city,
          browser,
          os,
          device: deviceType,
          event_type,
          url,
          visitor_id,
          session_id,
          marketing_params,
          language,
          timezone,
          extra_data
        },
        user_hash
      });

    if (error) {
      console.error("Error inserting analytics event:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
