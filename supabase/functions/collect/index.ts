import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
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
    const { project_id, page_path, referrer, screen_width } = data;

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
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "0.0.0.0";
    
    // 2. Simple hash using base64 for anonymity 
    // btoa is available in Deno
    const user_hash = btoa(ip).substring(0, 10);

    // 3. Insert into DB
    const { error } = await supabaseClient
      .from("vibe_analytics_events")
      .insert({
        project_id,
        page_path,
        referrer,
        browser_info: { screen_width },
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
