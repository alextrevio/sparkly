import { MOCK_ORG } from "@/lib/auth/mock";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  Sparkles,
  Brain,
  Palette,
  ScanEye,
  FolderPlus,
  ArrowRight,
} from "lucide-react";

const agents = [
  {
    type: "ads_expert",
    name: "Ads Expert",
    description: "Campañas de Meta Ads, Google Ads y TikTok Ads",
    icon: Target,
    color: "text-blue-400",
  },
  {
    type: "content_creator",
    name: "Content Creator",
    description: "Copy, calendarios editoriales y contenido para redes",
    icon: Sparkles,
    color: "text-pink-400",
  },
  {
    type: "strategist",
    name: "Estratega Digital",
    description: "Estrategia de marketing, análisis y KPIs",
    icon: Brain,
    color: "text-green-400",
  },
  {
    type: "brand_designer",
    name: "Brand Designer",
    description: "Identidad visual, branding y guías de estilo",
    icon: Palette,
    color: "text-orange-400",
  },
  {
    type: "consultor",
    name: "Consultor Sparkli",
    description: "Auditorías, diagnósticos y recomendaciones",
    icon: ScanEye,
    color: "text-purple-400",
  },
];

export default async function DashboardPage() {
  const org = MOCK_ORG;

  // Projects will be loaded from Supabase if available, otherwise empty
  type Project = { id: string; name: string; description: string | null; industry: string | null };
  let projects: Project[] = [];
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabaseClient();
    const { data: projectsData } = await supabase
      .from("projects")
      .select("id, name, description, industry")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .limit(5);
    projects = (projectsData ?? []) as Project[];
  } catch {
    // Supabase not configured, show empty state
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Bienvenido a <span className="text-gradient">Sparkli</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Tu agencia de publicidad con IA, al alcance de tu mano.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Créditos disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{org?.credits_remaining ?? 50}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plan actual</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold capitalize">
              {org?.plan ?? "Free"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Proyectos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projects?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tus Proyectos</h2>
          <Link href="/projects">
            <Button variant="outline" size="sm">
              <FolderPlus className="h-4 w-4 mr-2" />
              Nuevo proyecto
            </Button>
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <CardDescription>
                      {project.industry ?? "Sin industria"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description ?? "Sin descripción"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Crea tu primer proyecto para empezar
              </p>
              <Link href="/projects">
                <Button>
                  Crear proyecto
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Agents */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Tu Equipo de IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card
              key={agent.type}
              className="hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <agent.icon className={`h-5 w-5 ${agent.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {agent.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
