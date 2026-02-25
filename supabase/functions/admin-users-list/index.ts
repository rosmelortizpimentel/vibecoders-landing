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

    // Fetch subscriptions
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id, tier, founder_number, subscription_status, current_period_end, signup_source");
    if (subsError) console.error("Error fetching subscriptions:", subsError);

    const subsMap = new Map<string, { tier: string; founder_number: number | null; subscription_status: string | null; current_period_end: string | null; signup_source: string | null }>();
    if (subscriptions) {
      for (const s of subscriptions) {
        subsMap.set(s.user_id, {
          tier: s.tier,
          founder_number: s.founder_number,
          subscription_status: s.subscription_status,
          current_period_end: s.current_period_end,
          signup_source: s.signup_source,
        });
      }
    }

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

    // Fetch apps count per user
    const { data: appsData, error: appsError } = await supabaseAdmin
      .from("apps")
      .select("user_id")
      .eq("is_visible", true);
    if (appsError) console.error("Error fetching apps:", appsError);

    const appsCountMap = new Map<string, number>();
    if (appsData) {
      for (const app of appsData) {
        appsCountMap.set(app.user_id, (appsCountMap.get(app.user_id) || 0) + 1);
      }
    }

    // Fetch profile views count per user
    const { data: viewsData, error: viewsError } = await supabaseAdmin
      .from("profile_views")
      .select("profile_id");
    if (viewsError) console.error("Error fetching profile views:", viewsError);

    const viewsCountMap = new Map<string, number>();
    if (viewsData) {
      for (const v of viewsData) {
        viewsCountMap.set(v.profile_id, (viewsCountMap.get(v.profile_id) || 0) + 1);
      }
    }

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

      let lastActivity: string | null = lastSignIn;
      let lastActivityDateOnly = false;
      if (lastActivityDate) {
        // Compare: if activity date is more recent than lastSignIn date
        const signInDate = lastSignIn ? lastSignIn.split('T')[0] : '';
        if (!lastActivity || lastActivityDate > signInDate) {
          // Use the date-only value — don't fabricate a fake time
          lastActivity = lastActivityDate;
          lastActivityDateOnly = true;
        }
      }

      const isOnWaitlist = waitlistEmails.has(email.toLowerCase());
      const followersCount = follows?.filter((f) => f.following_id === profile.id).length || 0;
      const followingCount = follows?.filter((f) => f.follower_id === profile.id).length || 0;

      const sub = subsMap.get(profile.id);

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
        lastActivityDateOnly,
        tier: sub?.tier || null,
        founder_number: sub?.founder_number || null,
        subscription_status: sub?.subscription_status || null,
        current_period_end: sub?.current_period_end || null,
        signup_source: sub?.signup_source || null,
        appsCount: appsCountMap.get(profile.id) || 0,
        profileViews: viewsCountMap.get(profile.id) || 0,
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
