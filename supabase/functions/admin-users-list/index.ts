import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: hasRole } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, name, username, avatar_url, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch auth users for emails and last_sign_in_at
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });
    if (authUsersError) throw authUsersError;

    const userAuthMap = new Map<string, { email: string; lastSignIn: string | null }>();
    for (const u of authUsers.users) {
      userAuthMap.set(u.id, {
        email: u.email || "",
        lastSignIn: u.last_sign_in_at || null,
      });
    }

    // Fetch waitlist emails
    const { data: waitlistEntries, error: waitlistError } = await supabaseAdmin
      .from("waitlist")
      .select("email");
    if (waitlistError) throw waitlistError;

    const waitlistEmails = new Set(
      (waitlistEntries || []).map((w) => w.email.toLowerCase())
    );

    // Fetch follows
    const { data: follows, error: followsError } = await supabaseAdmin
      .from("follows")
      .select("follower_id, following_id");
    if (followsError) throw followsError;

    // Fetch latest activity per user from user_activity_log
    const { data: activityData, error: activityError } = await supabaseAdmin
      .from("user_activity_log")
      .select("user_id, active_date")
      .order("active_date", { ascending: false });

    if (activityError) {
      console.error("Error fetching activity log:", activityError);
    }

    // Build map: user_id -> latest active_date
    const latestActivityMap = new Map<string, string>();
    if (activityData) {
      for (const row of activityData) {
        if (!latestActivityMap.has(row.user_id)) {
          latestActivityMap.set(row.user_id, row.active_date);
        }
      }
    }

    // Build daily activity counts (last 30 days) in Toronto time
    const dailyActivityMap = new Map<string, Set<string>>();
    if (activityData) {
      for (const row of activityData) {
        // active_date is already a string 'YYYY-MM-DD' from the DB
        if (!dailyActivityMap.has(row.active_date)) {
          dailyActivityMap.set(row.active_date, new Set());
        }
        dailyActivityMap.get(row.active_date)!.add(row.user_id);
      }
    }

    const dailyActivity: Array<{ date: string; count: number }> = [];
    const now = new Date();
    
    // Helper to get YYYY-MM-DD in Toronto time
    const getTorontoDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    };

    const torontoTodayStr = getTorontoDate(now);
    const [year, month, day] = torontoTodayStr.split('-').map(Number);
    // Create a date object representing the start of today in Toronto to iterate backwards correctly
    const torontoTodayMid = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

    for (let i = 29; i >= 0; i--) {
      const d = new Date(torontoTodayMid);
      d.setUTCDate(d.getUTCDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const usersSet = dailyActivityMap.get(dateKey);
      dailyActivity.push({ date: dateKey, count: usersSet ? usersSet.size : 0 });
    }

    // Build enriched users
    const enrichedUsers = (profiles || []).map((profile) => {
      const authInfo = userAuthMap.get(profile.id);
      const email = authInfo?.email || "";
      const lastSignIn = authInfo?.lastSignIn || null;
      const lastActivityDate = latestActivityMap.get(profile.id) || null;

      // Determine most recent activity: compare lastSignIn and lastActivityDate
      let lastActivity: string | null = lastSignIn;
      if (lastActivityDate) {
        const activityTs = new Date(lastActivityDate + "T23:59:59Z").toISOString();
        if (!lastActivity || activityTs > lastActivity) {
          lastActivity = activityTs;
        }
      }

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
        lastActivity,
      };
    });

    console.log(`Returning ${enrichedUsers.length} enriched users + daily activity`);

    return new Response(JSON.stringify({ users: enrichedUsers, dailyActivity }), {
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
