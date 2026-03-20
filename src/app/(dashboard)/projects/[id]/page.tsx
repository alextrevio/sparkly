import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  Sparkles,
  Brain,
  Palette,
  ScanEye,
  ArrowRight,
  FileOutput,
  Brush,
} from "lucide-react";

const agents = [
  {
    type: "ads_expert",
    name: "Ads Expert",
    description: "Crea campañas, ad copy, briefs creativos y planes de pauta para Meta, Google y TikTok Ads.",
    icon: Target,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    type: "content_creator",
    name: "Content Creator",
    description: "Genera calendarios editoriales, copy para redes, emails, landing pages y scripts de video.",
    icon: Sparkles,
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
  },
  {
    type: "strategist",
    name: "Estratega Digital",
    description: "Planes de marketing, auditorías digitales, análisis competitivo y buyer personas.",
    icon: Brain,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    type: "brand_designer",
    name: "Brand Designer",
    description: "Brand boards, guías de estilo, identidad visual y naming.",
    icon: Palette,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  {
    type: "consultor",
    name: "Consultor Sparkli",
    description: "Auditorías de ads, contenido, marca y sitio web con score y recomendaciones.",
    icon: ScanEye,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
];

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  type Project = Database["public"]["Tables"]["projects"]["Row"];
  type GeneratedOutput = Database["public"]["Tables"]["generated_outputs"]["Row"];

  const { data: projectData } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  const project = projectData as Project | null;
  if (!project) notFound();

  const { data: recentOutputsData } = await supabase
    .from("generated_outputs")
    .select("*, conversations(agent_type)")
    .eq("conversation_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentOutputs = recentOutputsData as (GeneratedOutput & { conversations: { agent_type: string } | null })[] | null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">
            {project.industry ?? "Sin industria"} &middot;{" "}
            {project.description ?? "Sin descripción"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${id}/outputs`}>
            <Button variant="outline" size="sm">
              <FileOutput className="h-4 w-4 mr-2" />
              Outputs
            </Button>
          </Link>
          <Link href={`/projects/${id}/brand`}>
            <Button variant="outline" size="sm">
              <Brush className="h-4 w-4 mr-2" />
              Brand Hub
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Elige un agente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Link
              key={agent.type}
              href={`/projects/${id}/agents/${agent.type}`}
            >
              <Card className="hover:border-primary/50 transition-all cursor-pointer h-full group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${agent.bgColor}`}>
                      <agent.icon className={`h-5 w-5 ${agent.color}`} />
                    </div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {agent.description}
                  </p>
                  <div className="flex items-center gap-1 text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Iniciar conversación</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {recentOutputs && recentOutputs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Outputs recientes</h2>
          <div className="space-y-2">
            {recentOutputs.map((output) => (
              <Card key={output.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{output.output_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(output.created_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {output.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
