import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { PlanType } from "@/lib/supabase/types";

const PLAN_CREDITS: Record<string, number> = {
  free: 50,
  starter: 500,
  pro: 2000,
  agency: 10000,
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orgId = session.metadata?.org_id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.toString();

      if (orgId && subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const plan = (subscription.metadata?.plan ?? "starter") as PlanType;

        await supabase
          .from("organizations")
          .update({
            plan,
            stripe_subscription_id: subscriptionId,
            credits_remaining: PLAN_CREDITS[plan] ?? 500,
          })
          .eq("id", orgId);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as unknown as Record<string, unknown>;
      const subscriptionId = invoice.subscription
        ? String(invoice.subscription)
        : null;

      if (subscriptionId) {
        const { data } = await supabase
          .from("organizations")
          .select("id, plan")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        const invoiceOrg = data as { id: string; plan: string } | null;
        if (invoiceOrg) {
          const credits = PLAN_CREDITS[invoiceOrg.plan] ?? 500;
          await supabase
            .from("organizations")
            .update({ credits_remaining: credits })
            .eq("id", invoiceOrg.id);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const subId = String(subscription.id);
      const { data } = await supabase
        .from("organizations")
        .select("id")
        .eq("stripe_subscription_id", subId)
        .single();

      const deletedOrg = data as { id: string } | null;
      if (deletedOrg) {
        await supabase
          .from("organizations")
          .update({
            plan: "free" as PlanType,
            stripe_subscription_id: null,
            credits_remaining: 50,
          })
          .eq("id", deletedOrg.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
