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
     // Get user from JWT - required to view own stats
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       return new Response(
         JSON.stringify({ error: "Authentication required" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const supabase = createClient(
       Deno.env.get("SUPABASE_URL")!,
       Deno.env.get("SUPABASE_ANON_KEY")!,
       { global: { headers: { Authorization: authHeader } } }
     );
 
     const { data: { user }, error: authError } = await supabase.auth.getUser();
     if (authError || !user) {
       return new Response(
         JSON.stringify({ error: "Invalid authentication" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const profile_id = user.id;
 
     // Use service role to access stats tables (RLS restricts to owner)
     const supabaseAdmin = createClient(
       Deno.env.get("SUPABASE_URL")!,
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
     );
 
     // Get profile views count
     const { count: viewsCount } = await supabaseAdmin
       .from("profile_views")
       .select("*", { count: "exact", head: true })
       .eq("profile_id", profile_id);
 
     // Get total app clicks count
     const { count: clicksCount } = await supabaseAdmin
       .from("app_clicks")
       .select("*", { count: "exact", head: true })
       .eq("profile_id", profile_id);
 
     // Get likes per app
     const { data: userApps } = await supabaseAdmin
       .from("apps")
       .select("id")
       .eq("user_id", profile_id)
       .eq("is_visible", true);
 
     const appLikes: Record<string, number> = {};
     const appClicks: Record<string, number> = {};
     
     if (userApps && userApps.length > 0) {
       const appIds = userApps.map(app => app.id);
       
       // Get like and click counts for each app
       for (const appId of appIds) {
         const { count } = await supabaseAdmin
           .from("app_likes")
           .select("*", { count: "exact", head: true })
           .eq("app_id", appId);
         
         appLikes[appId] = count || 0;

         const { count: clickCount } = await supabaseAdmin
           .from("app_clicks")
           .select("*", { count: "exact", head: true })
           .eq("app_id", appId);
         
         appClicks[appId] = clickCount || 0;
       }
     }
 
     console.log(`Stats fetched for profile ${profile_id}: ${viewsCount} views, ${clicksCount} clicks`);
     
     return new Response(
       JSON.stringify({
         profile_views: viewsCount || 0,
         app_clicks: clicksCount || 0,
         app_likes: appLikes,
         app_clicks_by_app: appClicks,
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in get-profile-stats:", errMsg);
    return new Response(
      JSON.stringify({ error: errMsg }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });