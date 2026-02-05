 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const authHeader = req.headers.get("Authorization");
 
     if (!authHeader) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Create client with user's token to check if they're admin
     const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
       global: { headers: { Authorization: authHeader } },
     });
 
     // Verify the user is an admin
     const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
       authHeader.replace("Bearer ", "")
     );
 
     if (authError || !user) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Check admin role
     const { data: roleData } = await supabaseClient
       .from("user_roles")
       .select("role")
       .eq("user_id", user.id)
       .eq("role", "admin")
       .maybeSingle();
 
     if (!roleData) {
       return new Response(JSON.stringify({ error: "Forbidden: Admin role required" }), {
         status: 403,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Create admin client with service role
     const adminClient = createClient(supabaseUrl, serviceRoleKey);
 
     // Fetch waitlist entries
     const { data: waitlistData, error: waitlistError } = await adminClient
       .from("waitlist")
       .select("id, email, timezone, created_at")
       .order("created_at", { ascending: false });
 
     if (waitlistError) throw waitlistError;
 
     // Fetch all auth users to match by email
     const { data: authUsers, error: authUsersError } = await adminClient.auth.admin.listUsers({
       perPage: 1000,
     });
 
     if (authUsersError) throw authUsersError;
 
     // Create a map of normalized emails to auth user ids
     const emailToUserId = new Map<string, string>();
     authUsers.users.forEach((u) => {
       if (u.email) {
         const normalized = normalizeEmail(u.email);
         emailToUserId.set(normalized, u.id);
       }
     });
 
     // Fetch profiles for matched users
     const matchedUserIds = Array.from(new Set(emailToUserId.values()));
     const { data: profilesData } = await adminClient
       .from("profiles")
       .select("id, name, username, avatar_url")
       .in("id", matchedUserIds);
 
    interface ProfileData {
      id: string;
      name: string | null;
      username: string | null;
      avatar_url: string | null;
    }
    const profilesMap = new Map<string, ProfileData>();
    profilesData?.forEach((p: ProfileData) => profilesMap.set(p.id, p));
 
     // Map waitlist entries with registration status
     const result = (waitlistData || []).map((entry) => {
       const normalizedEmail = normalizeEmail(entry.email);
       const matchedUserId = emailToUserId.get(normalizedEmail);
       const matchedProfile = matchedUserId ? profilesMap.get(matchedUserId) : null;
 
       return {
         id: entry.id,
         email: entry.email,
         timezone: entry.timezone,
         created_at: entry.created_at,
         registered: !!matchedProfile,
         profile: matchedProfile
           ? {
               id: matchedProfile.id,
               name: matchedProfile.name,
               username: matchedProfile.username,
               avatar_url: matchedProfile.avatar_url,
             }
           : null,
       };
     });
 
     return new Response(JSON.stringify(result), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
  } catch (error: unknown) {
    console.error("Error in admin-waitlist-status:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });
 
 function normalizeEmail(email: string): string {
   const [localPart, domain] = email.toLowerCase().split("@");
   return localPart.split("+")[0] + "@" + domain;
 }