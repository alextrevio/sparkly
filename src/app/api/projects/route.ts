import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: memberships } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id);

  if (!memberships?.length) {
    return NextResponse.json({ data: [] });
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", memberships[0].org_id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ data: projects ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();

  const { data: memberships } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id);

  if (!memberships?.length) {
    return NextResponse.json({ error: "Sin organización" }, { status: 403 });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      org_id: memberships[0].org_id,
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
