import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Use service role to bypass RLS and get accurate counts
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get total profiles count
    const { count: profileCount, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (profileError) throw profileError;

    // 2. Get total apps count
    const { count: appCount, error: appError } = await supabaseAdmin
      .from("apps")
      .select("*", { count: "exact", head: true });

    if (appError) throw appError;

    // 3. Get real founder count from user_subscriptions
    const { count: founderCount, error: founderError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("tier", "founder");

    // Get max founder_number (already includes +20 offset in DB)
    const { data: maxData } = await supabaseAdmin
      .from("user_subscriptions")
      .select("founder_number")
      .not("founder_number", "is", null)
      .order("founder_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const maxFounderNumber = maxData?.founder_number || (profileCount || 0) + 20;
    const totalApps = appCount || 0;
    const spotsLeft = Math.max(0, 100 - maxFounderNumber);

    return new Response(
      JSON.stringify({
        totalBuilders: maxFounderNumber,
        totalApps: totalApps,
        spotsLeft: spotsLeft
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in landing-stats function:", (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
