"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileOutput } from "lucide-react";

interface Output {
  id: string;
  agent_type: string;
  output_type: string;
  content: Record<string, unknown>;
  status: string;
  rating: number | null;
  created_at: string;
}

const agentLabels: Record<string, string> = {
  ads_expert: "Ads Expert",
  content_creator: "Content Creator",
  strategist: "Estratega Digital",
  brand_designer: "Brand Designer",
  consultor: "Consultor",
};

export default function OutputsPage() {
  const { id } = useParams();
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const supabase = createClient();

  useEffect(() => {
    loadOutputs();
  }, []);

  async function loadOutputs() {
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("project_id", id as string);

    const convRows = conversations as { id: string }[] | null;
    if (!convRows?.length) return;

    const convIds = convRows.map((c) => c.id);
    const { data } = await supabase
      .from("generated_outputs")
      .select("*")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });

    if (data) setOutputs(data as Output[]);
  }

  const filtered =
    filter === "all" ? outputs : outputs.filter((o) => o.agent_type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Outputs Generados</h1>
        <p className="text-muted-foreground">
          Todo lo que tus agentes han creado para este proyecto
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
        {Object.entries(agentLabels).map(([key, label]) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((output) => (
            <Card key={output.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm capitalize">
                    {output.output_type.replace(/_/g, " ")}
                  </CardTitle>
                  <Badge variant={output.status === "approved" ? "default" : "secondary"}>
                    {output.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  {agentLabels[output.agent_type]} &middot;{" "}
                  {new Date(output.created_at).toLocaleDateString("es-MX")}
                </p>
                <pre className="text-xs bg-muted rounded p-2 max-h-32 overflow-auto">
                  {JSON.stringify(output.content, null, 2).slice(0, 300)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileOutput className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aún no hay outputs generados. Conversa con un agente para crear
              contenido.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
