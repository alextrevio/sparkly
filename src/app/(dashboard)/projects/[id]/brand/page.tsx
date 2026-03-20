"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brush, Save, Globe, Users } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export default function BrandHubPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [brandVoice, setBrandVoice] = useState("");
  const [website, setWebsite] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadProject();
  }, []);

  async function loadProject() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id as string)
      .single();

    const row = data as Project | null;
    if (row) {
      setProject(row);
      setBrandVoice(row.brand_voice ?? "");
      setWebsite(row.website_url ?? "");
      setTargetAudience(
        typeof row.target_audience === "object"
          ? JSON.stringify(row.target_audience, null, 2)
          : ""
      );
    }
  }

  async function handleSave() {
    setSaving(true);
    let parsedAudience = {};
    try {
      parsedAudience = JSON.parse(targetAudience);
    } catch {
      parsedAudience = { description: targetAudience };
    }

    await supabase
      .from("projects")
      .update({
        brand_voice: brandVoice,
        website_url: website,
        target_audience: parsedAudience,
      })
      .eq("id", id as string);

    setSaving(false);
  }

  if (!project) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brush className="h-6 w-6 text-primary" />
          Brand Hub
        </h1>
        <p className="text-muted-foreground">
          Configura la identidad de {project.name} para que los agentes generen
          contenido alineado
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voz de Marca</CardTitle>
          <CardDescription>
            Define el tono y estilo de comunicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Ej: Profesional pero accesible, con toques de humor. Evitar lenguaje demasiado formal."
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sitio Web
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://tu-sitio.com"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audiencia Objetivo
          </CardTitle>
          <CardDescription>
            Describe tu público objetivo o pega un JSON con datos demográficos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder='Ej: Mujeres de 25-45 años, interesadas en fitness y bienestar, nivel socioeconómico medio-alto, en CDMX y Monterrey.'
            rows={4}
          />
        </CardContent>
      </Card>

      {project.brand_colors &&
        Object.keys(project.brand_colors).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Colores de Marca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {Object.entries(project.brand_colors).map(([name, color]) => (
                  <div key={name} className="text-center">
                    <div
                      className="w-12 h-12 rounded-lg border border-border"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {name}
                    </p>
                    <p className="text-xs font-mono">{color}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      <Button onClick={handleSave} disabled={saving}>
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}
