import { MOCK_USER, MOCK_ORG } from "@/lib/auth/mock";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { priceId } = await request.json();

  const customer = await stripe.customers.create({
    email: MOCK_USER.email,
    metadata: { org_id: MOCK_ORG.id },
  });

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { org_id: MOCK_ORG.id },
  });

  return NextResponse.json({ url: session.url });
}
