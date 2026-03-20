import type { AgentType, PlanType } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";

/** Credits consumed per agent interaction */
export const CREDIT_COSTS: Record<AgentType, number> = {
  ads_expert: 2,
  content_creator: 1,
  strategist: 2,
  brand_designer: 2,
  consultor: 3,
};

/** Monthly credit allowance per plan */
export const PLAN_CREDITS: Record<PlanType, number> = {
  free: 10,
  starter: 100,
  pro: 500,
  agency: 2000,
};

/**
 * Calculate the credit cost for an agent interaction.
 * Optionally factor in token usage for more granular billing.
 */
export function calculateCreditCost(
  agentType: AgentType,
  tokensUsed?: { input: number; output: number }
): number {
  const baseCost = CREDIT_COSTS[agentType];

  if (!tokensUsed) return baseCost;

  // Add extra credits for heavy token usage (over 2000 output tokens)
  const extraCredits = Math.floor(tokensUsed.output / 2000);
  return baseCost + extraCredits;
}

/**
 * Check if an organization has enough credits for an agent interaction.
 */
export async function hasEnoughCredits(
  orgId: string,
  agentType: AgentType
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("credits_remaining")
    .eq("id", orgId)
    .single();

  if (error || !data) return false;

  return data.credits_remaining >= CREDIT_COSTS[agentType];
}

/**
 * Deduct credits from an organization and log the usage.
 * Returns the number of credits remaining, or null on failure.
 */
export async function deductCredits(
  orgId: string,
  agentType: AgentType,
  tokensInput: number,
  tokensOutput: number,
  conversationId?: string
): Promise<number | null> {
  const supabase = createAdminClient();
  const cost = calculateCreditCost(agentType, {
    input: tokensInput,
    output: tokensOutput,
  });

  // Fetch current credits
  const { data: org, error: fetchError } = await supabase
    .from("organizations")
    .select("credits_remaining")
    .eq("id", orgId)
    .single();

  if (fetchError || !org) return null;

  if (org.credits_remaining < cost) return null;

  const newCredits = org.credits_remaining - cost;

  // Update credits
  const { error: updateError } = await supabase
    .from("organizations")
    .update({ credits_remaining: newCredits })
    .eq("id", orgId);

  if (updateError) return null;

  // Log usage
  await supabase.from("usage_logs").insert({
    org_id: orgId,
    agent_type: agentType,
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    credits_consumed: cost,
    conversation_id: conversationId ?? null,
  });

  return newCredits;
}
