 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 Deno.serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     const { profile_id, device_fingerprint, device_type, referrer } = await req.json();
 
     if (!profile_id || !device_fingerprint) {
       return new Response(
         JSON.stringify({ error: "profile_id and device_fingerprint are required" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create Supabase client with service role for insert
     const supabaseAdmin = createClient(
       Deno.env.get("SUPABASE_URL")!,
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
     );
 
     // Check for visitor_id from JWT (optional)
     let visitor_id: string | null = null;
     const authHeader = req.headers.get("Authorization");
     if (authHeader) {
       const supabaseAuth = createClient(
         Deno.env.get("SUPABASE_URL")!,
         Deno.env.get("SUPABASE_ANON_KEY")!,
         { global: { headers: { Authorization: authHeader } } }
       );
       const { data: { user } } = await supabaseAuth.auth.getUser();
       if (user) {
         visitor_id = user.id;
       }
     }

     // Don't track if user is viewing their own profile
     if (visitor_id && visitor_id === profile_id) {
       console.log("Skipping self-view tracking");
       return new Response(
         JSON.stringify({ success: true, skipped: true, reason: "self_view" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Check if same fingerprint already viewed this profile in last 24 hours
     const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
     
     const { data: recentView } = await supabaseAdmin
       .from("profile_views")
       .select("id")
       .eq("profile_id", profile_id)
       .eq("device_fingerprint", device_fingerprint)
       .gte("created_at", twentyFourHoursAgo)
       .limit(1)
       .single();
 
     if (recentView) {
       console.log("View already recorded for this fingerprint in last 24h");
       return new Response(
         JSON.stringify({ success: true, duplicate: true }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Insert new view
     const { error } = await supabaseAdmin
       .from("profile_views")
       .insert({
         profile_id,
         visitor_id,
         device_fingerprint,
         device_type: device_type || null,
         referrer: referrer || null,
       });
 
     if (error) {
       console.error("Error inserting profile view:", error);
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     console.log(`Profile view recorded for profile ${profile_id}`);
     return new Response(
       JSON.stringify({ success: true }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in track-profile-view:", errMsg);
    return new Response(
      JSON.stringify({ error: errMsg }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });