import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const signature = req.headers.get("stripe-signature");
      if (!signature) throw new Error("No stripe-signature header");
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    console.log(`[STRIPE-WEBHOOK] Event: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) {
        console.error("No userId in session metadata");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Read the actual amount from the session (in cents -> dollars)
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0;

      // Fetch subscription to get current_period_end
      let currentPeriodEnd: string | null = null;
      if (session.subscription) {
        try {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          if (sub.current_period_end) {
            currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
          }
        } catch (e) {
          console.error("[STRIPE-WEBHOOK] Could not fetch subscription details:", (e as Error).message);
        }
      }

      await supabaseAdmin
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          tier: "pro",
          price: amountTotal,
          stripe_customer_id: session.customer as string,
          subscription_id: session.subscription as string,
          subscription_status: "active",
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      console.log(`[STRIPE-WEBHOOK] User ${userId} upgraded to pro (paid $${amountTotal})`);
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: sub } = await supabaseAdmin
        .from("user_subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (sub) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        await supabaseAdmin
          .from("user_subscriptions")
          .update({
            subscription_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            tier: isActive ? "pro" : "free",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", sub.user_id);

        console.log(`[STRIPE-WEBHOOK] Updated subscription for user ${sub.user_id}: ${subscription.status}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Error:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
