import { createServerSupabaseClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { priceId } = await request.json();

  const { data: memberships } = await supabase
    .from("org_members")
    .select("org_id, organizations(id, stripe_customer_id)")
    .eq("user_id", user.id)
    .eq("role", "owner");

  if (!memberships?.length) {
    return NextResponse.json({ error: "No eres owner" }, { status: 403 });
  }

  const org = (memberships[0] as Record<string, unknown>).organizations as {
    id: string;
    stripe_customer_id: string | null;
  };

  let customerId = org.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { org_id: org.id },
    });
    customerId = customer.id;

    await supabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", org.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { org_id: org.id },
  });

  return NextResponse.json({ url: session.url });
}
