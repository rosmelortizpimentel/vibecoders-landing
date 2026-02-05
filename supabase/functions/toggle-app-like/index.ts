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
     const { app_id } = await req.json();
 
     if (!app_id) {
       return new Response(
         JSON.stringify({ error: "app_id is required" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Get user from JWT - required for likes
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
 
     // Check if like exists
     const { data: existingLike } = await supabase
       .from("app_likes")
       .select("id")
       .eq("app_id", app_id)
       .eq("user_id", user.id)
       .single();
 
     let liked = false;
 
     if (existingLike) {
       // Unlike - delete the like
       const { error } = await supabase
         .from("app_likes")
         .delete()
         .eq("app_id", app_id)
         .eq("user_id", user.id);
 
       if (error) {
         console.error("Error deleting like:", error);
         return new Response(
           JSON.stringify({ error: error.message }),
           { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       liked = false;
     } else {
       // Like - insert new like
       const { error } = await supabase
         .from("app_likes")
         .insert({ app_id, user_id: user.id });
 
       if (error) {
         console.error("Error inserting like:", error);
         return new Response(
           JSON.stringify({ error: error.message }),
           { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       liked = true;
     }
 
     // Get updated like count
     const { count } = await supabase
       .from("app_likes")
       .select("*", { count: "exact", head: true })
       .eq("app_id", app_id);
 
     console.log(`App ${app_id} ${liked ? 'liked' : 'unliked'} by user ${user.id}`);
     return new Response(
       JSON.stringify({ success: true, liked, count: count || 0 }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in toggle-app-like:", errMsg);
    return new Response(
      JSON.stringify({ error: errMsg }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });