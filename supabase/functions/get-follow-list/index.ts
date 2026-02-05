 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     const url = new URL(req.url);
     const profileId = url.searchParams.get("profileId");
     const type = url.searchParams.get("type") as "followers" | "following";
     const currentUserId = url.searchParams.get("currentUserId");
 
     if (!profileId || !type) {
       return new Response(
         JSON.stringify({ success: false, error: "Missing profileId or type" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
       );
     }
 
     const supabaseAdmin = createClient(
       Deno.env.get("SUPABASE_URL") ?? "",
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
     );
 
     // Get the list of user IDs based on type
     let userIds: string[] = [];
 
     if (type === "followers") {
       const { data: followsData } = await supabaseAdmin
         .from("follows")
         .select("follower_id")
         .eq("following_id", profileId);
 
       userIds = followsData?.map((f) => f.follower_id) || [];
     } else {
       const { data: followsData } = await supabaseAdmin
         .from("follows")
         .select("following_id")
         .eq("follower_id", profileId);
 
       userIds = followsData?.map((f) => f.following_id) || [];
     }
 
     if (userIds.length === 0) {
       return new Response(
         JSON.stringify({ success: true, profiles: [] }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Fetch profiles for these user IDs
     const { data: profilesData } = await supabaseAdmin
       .from("profiles")
       .select("id, username, name, avatar_url, tagline")
       .in("id", userIds);
 
     if (!profilesData || profilesData.length === 0) {
       return new Response(
         JSON.stringify({ success: true, profiles: [] }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Get auth.users data for profiles without name or avatar
     const profilesNeedingAuthData = profilesData.filter(
       (p) => !p.name || !p.avatar_url
     );
     
     let authUsersMap: Record<string, { name: string | null; avatar_url: string | null }> = {};
     
     if (profilesNeedingAuthData.length > 0) {
       const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
         perPage: 1000,
       });
 
       if (authData?.users) {
         for (const authUser of authData.users) {
           if (userIds.includes(authUser.id)) {
             const metadata = authUser.user_metadata || {};
             authUsersMap[authUser.id] = {
               name: metadata.full_name || metadata.name || null,
               avatar_url: metadata.avatar_url || metadata.picture || null,
             };
           }
         }
       }
     }
 
     // Check which ones the current user is following
     let currentUserFollowing: string[] = [];
     if (currentUserId) {
       const { data: followingData } = await supabaseAdmin
         .from("follows")
         .select("following_id")
         .eq("follower_id", currentUserId)
         .in("following_id", userIds);
 
       currentUserFollowing = followingData?.map((f) => f.following_id) || [];
     }
 
     // Build the final profiles list with fallback to auth.users data
     const enrichedProfiles = profilesData.map((p) => {
       const authData = authUsersMap[p.id];
       return {
         id: p.id,
         username: p.username,
         name: p.name || authData?.name || null,
         avatar_url: p.avatar_url || authData?.avatar_url || null,
         tagline: p.tagline,
         isFollowing: currentUserFollowing.includes(p.id),
       };
     });
 
     return new Response(
       JSON.stringify({ success: true, profiles: enrichedProfiles }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     console.error("Error in get-follow-list:", errorMessage);
     return new Response(
       JSON.stringify({ success: false, error: errorMessage }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
     );
   }
 });