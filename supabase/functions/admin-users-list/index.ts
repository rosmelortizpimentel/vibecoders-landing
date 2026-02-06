import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client to verify user auth and role
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client to access auth.users
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: hasRole } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasRole) {
      console.log("User is not admin:", user.id);
      return new Response(JSON.stringify({ error: "Forbidden: Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Admin access granted for user:", user.id);

    // Fetch all profiles with username (registered users)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, name, username, avatar_url, created_at")
      .not("username", "is", null)
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    // Fetch all auth users to get emails
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authUsersError) {
      console.error("Error fetching auth users:", authUsersError);
      throw authUsersError;
    }

    // Create a map of user id to email
    const userEmailMap = new Map<string, string>();
    for (const u of authUsers.users) {
      userEmailMap.set(u.id, u.email || "");
    }

    // Fetch waitlist emails
    const { data: waitlistEntries, error: waitlistError } = await supabaseAdmin
      .from("waitlist")
      .select("email");

    if (waitlistError) {
      console.error("Error fetching waitlist:", waitlistError);
      throw waitlistError;
    }

    // Create a set of waitlist emails (lowercase for comparison)
    const waitlistEmails = new Set(
      (waitlistEntries || []).map((w) => w.email.toLowerCase())
    );

    // Fetch follows for counts
    const { data: follows, error: followsError } = await supabaseAdmin
      .from("follows")
      .select("follower_id, following_id");

    if (followsError) {
      console.error("Error fetching follows:", followsError);
      throw followsError;
    }

    // Build enriched user data
    const enrichedUsers = (profiles || []).map((profile) => {
      const email = userEmailMap.get(profile.id) || "";
      const isOnWaitlist = waitlistEmails.has(email.toLowerCase());
      const followersCount = follows?.filter((f) => f.following_id === profile.id).length || 0;
      const followingCount = follows?.filter((f) => f.follower_id === profile.id).length || 0;

      return {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        email,
        isOnWaitlist,
        followersCount,
        followingCount,
      };
    });

    console.log(`Returning ${enrichedUsers.length} enriched users`);

    return new Response(JSON.stringify(enrichedUsers), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in admin-users-list:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
