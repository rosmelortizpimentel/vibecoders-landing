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
     const { app_id, profile_id, device_fingerprint } = await req.json();
 
     if (!app_id || !profile_id || !device_fingerprint) {
       return new Response(
         JSON.stringify({ error: "app_id, profile_id and device_fingerprint are required" }),
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
 
     // Insert click (no deduplication for clicks - they are intentional actions)
     const { error } = await supabaseAdmin
       .from("app_clicks")
       .insert({
         app_id,
         profile_id,
         visitor_id,
         device_fingerprint,
       });
 
     if (error) {
       console.error("Error inserting app click:", error);
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     console.log(`App click recorded for app ${app_id} on profile ${profile_id}`);
     return new Response(
       JSON.stringify({ success: true }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in track-app-click:", errMsg);
    return new Response(
      JSON.stringify({ error: errMsg }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });