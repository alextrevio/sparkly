import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MOCK_ORG } from "@/lib/auth/mock";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", MOCK_ORG.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ data: projects ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const body = await request.json();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      org_id: MOCK_ORG.id,
      name: body.name,
      description: body.description,
      industry: body.industry,
      brand_voice: body.brand_voice,
      website_url: body.website_url,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: project });
}
