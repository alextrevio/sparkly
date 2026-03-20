import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type GeneratedOutputRow = Database["public"]["Tables"]["generated_outputs"]["Row"];

export interface BrandContext {
  project: {
    name: string;
    description: string | null;
    industry: string | null;
    website_url: string | null;
    brand_voice: string | null;
    brand_colors: Record<string, string>;
    target_audience: Record<string, unknown>;
    social_accounts: Record<string, string>;
  };
  recentOutputs: {
    type: string;
    summary: string;
    created_at: string;
  }[];
}

export function buildBrandContext(
  project: ProjectRow,
  recentOutputs: GeneratedOutputRow[] = []
): BrandContext {
  return {
    project: {
      name: project.name,
      description: project.description,
      industry: project.industry,
      website_url: project.website_url,
      brand_voice: project.brand_voice,
      brand_colors: project.brand_colors,
      target_audience: project.target_audience,
      social_accounts: project.social_accounts,
    },
    recentOutputs: recentOutputs.map((output) => ({
      type: output.output_type,
      summary: summarizeOutput(output.content),
      created_at: output.created_at,
    })),
  };
}

function summarizeOutput(content: Record<string, unknown>): string {
  if (content.title && typeof content.title === "string") {
    return content.title;
  }
  if (content.summary && typeof content.summary === "string") {
    return content.summary;
  }
  const keys = Object.keys(content);
  if (keys.length === 0) return "Empty output";
  return `Output with fields: ${keys.slice(0, 5).join(", ")}`;
}

export function brandContextToString(context: BrandContext): string {
  return JSON.stringify(context, null, 2);
}
