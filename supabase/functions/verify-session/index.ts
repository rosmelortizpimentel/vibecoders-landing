import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    const userId = userData.user.id;

    // Read session_id from body
    const body = await req.json();
    const sessionId = body?.session_id;
    if (!sessionId) throw new Error("No session_id provided");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    // Verify the session belongs to this user
    if (session.metadata?.userId !== userId) {
      throw new Error("Session does not belong to this user");
    }

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ synced: false, reason: "not_paid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
    const subscription = session.subscription as Stripe.Subscription | null;
    const currentPeriodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    await supabaseAdmin
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        tier: "pro",
        price: amountTotal,
        stripe_customer_id: session.customer as string,
        subscription_id: typeof session.subscription === "string"
          ? session.subscription
          : subscription?.id || null,
        subscription_status: "active",
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    console.log(`[VERIFY-SESSION] Synced subscription for user ${userId}`);

    return new Response(JSON.stringify({ synced: true, tier: "pro" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[VERIFY-SESSION] Error:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
