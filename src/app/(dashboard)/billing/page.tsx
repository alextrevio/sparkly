"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/stripe/plans";
import { Check, Zap } from "lucide-react";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [credits, setCredits] = useState(50);
  const supabase = createClient();

  useEffect(() => {
    loadBilling();
  }, []);

  async function loadBilling() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberships } = await supabase
      .from("org_members")
      .select("organizations(plan, credits_remaining)")
      .eq("user_id", user.id);

    if (memberships?.length) {
      const org = (memberships[0] as Record<string, unknown>).organizations as {
        plan: string;
        credits_remaining: number;
      };
      setCurrentPlan(org.plan);
      setCredits(org.credits_remaining);
    }
  }

  async function handleUpgrade(planId: string) {
    // In production, this would create a Stripe Checkout session
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: planId }),
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Facturación</h1>
        <p className="text-muted-foreground">
          Gestiona tu plan y créditos
        </p>
      </div>

      {/* Current usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plan actual</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{currentPlan}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Créditos restantes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{credits}</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Planes disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={plan.popular ? "border-primary" : ""}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="w-fit mb-2">Más popular</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-bold">
                    ${plan.priceUSD}
                  </span>
                  <span className="text-muted-foreground"> USD/mes</span>
                  {plan.priceMXN > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ${plan.priceMXN.toLocaleString()} MXN/mes
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id === currentPlan ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plan actual
                  </Button>
                ) : plan.id === "free" ? null : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
