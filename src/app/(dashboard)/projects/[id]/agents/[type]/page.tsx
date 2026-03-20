"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChatContainer } from "@/components/chat/chat-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Target, Sparkles, Brain, Palette, ScanEye } from "lucide-react";
import type { AgentType } from "@/lib/supabase/types";

const agentInfo: Record<
  AgentType,
  {
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    templates: { name: string; prompt: string }[];
  }
> = {
  ads_expert: {
    name: "Ads Expert",
    description: "Especialista en Meta Ads, Google Ads y TikTok Ads",
    icon: Target,
    color: "text-blue-400",
    templates: [
      {
        name: "Lanzar campaña",
        prompt: "Quiero lanzar una campaña publicitaria. Mi objetivo es [objetivo], mi presupuesto es [presupuesto] y mi audiencia es [audiencia]. La plataforma principal es [plataforma].",
      },
      {
        name: "Generar ad copy",
        prompt: "Necesito 5 variantes de ad copy para [producto/servicio]. El beneficio principal es [beneficio] y el CTA deseado es [CTA]. Plataforma: [plataforma].",
      },
      {
        name: "Auditar campaña",
        prompt: "Necesito una auditoría de mi campaña actual. Aquí están los datos: [pegar datos o describir la campaña].",
      },
      {
        name: "Brief creativo",
        prompt: "Necesito un brief creativo para un [formato: reel/carrusel/story] sobre [tema]. Objetivo: [objetivo].",
      },
      {
        name: "Plan de pauta",
        prompt: "Necesito un plan de pauta con presupuesto total de [presupuesto] por [periodo]. Objetivos: [objetivos].",
      },
    ],
  },
  content_creator: {
    name: "Content Creator",
    description: "Copywriter y estratega de contenido",
    icon: Sparkles,
    color: "text-pink-400",
    templates: [
      {
        name: "Calendario editorial",
        prompt: "Crea un calendario editorial mensual. Pilares de contenido: [pilares]. Frecuencia: [frecuencia]. Plataformas: [plataformas].",
      },
      {
        name: "Pack de redes",
        prompt: "Genera un pack de 10 posts para redes sociales sobre [tema/promoción]. Plataformas: [plataformas].",
      },
      {
        name: "Secuencia de emails",
        prompt: "Crea una secuencia de emails de [tipo: welcome/venta/nurture]. Audiencia: [audiencia]. Objetivo: [objetivo].",
      },
      {
        name: "Landing page copy",
        prompt: "Escribe el copy completo para una landing page de [producto/servicio]. Beneficios principales: [beneficios]. Objeciones comunes: [objeciones].",
      },
      {
        name: "Script de video",
        prompt: "Crea un script de video [formato: reel/TikTok/YouTube]. Duración: [duración]. Gancho: [gancho]. CTA: [CTA].",
      },
    ],
  },
  strategist: {
    name: "Estratega Digital",
    description: "Consultor sénior en marketing digital y estrategia",
    icon: Brain,
    color: "text-green-400",
    templates: [
      {
        name: "Auditoría digital 360°",
        prompt: "Necesito una auditoría completa de mi presencia digital. Mi sitio web es [URL], mis redes son [URLs]. Industria: [industria].",
      },
      {
        name: "Plan de marketing",
        prompt: "Crea un plan de marketing digital. Objetivos de negocio: [objetivos]. Presupuesto: [presupuesto]. Timeline: [timeline].",
      },
      {
        name: "Análisis competitivo",
        prompt: "Analiza a mis competidores: [lista de competidores con URLs]. Mi mercado objetivo es [mercado].",
      },
      {
        name: "Buyer persona",
        prompt: "Define mis buyer personas. Producto/servicio: [producto]. Datos de clientes actuales: [datos].",
      },
      {
        name: "Growth roadmap",
        prompt: "Crea un growth roadmap. Situación actual: [situación]. Meta a 6 meses: [meta].",
      },
    ],
  },
  brand_designer: {
    name: "Brand Designer",
    description: "Director creativo y estratega de marca",
    icon: Palette,
    color: "text-orange-400",
    templates: [
      {
        name: "Brand board",
        prompt: "Crea un brand board completo. Industria: [industria]. Valores de marca: [valores]. Audiencia: [audiencia]. Referencias que me gustan: [referencias].",
      },
      {
        name: "Brand guidelines",
        prompt: "Genera una guía de estilo completa. Logo actual: [descripción]. Colores actuales: [colores]. Marca: [nombre de marca].",
      },
      {
        name: "Social media kit",
        prompt: "Diseña un kit de redes sociales. Brand guidelines: [describir]. Plataformas: [plataformas].",
      },
      {
        name: "Naming session",
        prompt: "Necesito opciones de nombre. Industria: [industria]. Valores: [valores]. Audiencia: [audiencia]. Idioma preferido: [idioma].",
      },
    ],
  },
  consultor: {
    name: "Consultor Sparkli",
    description: "Auditor y analista senior de marketing digital",
    icon: ScanEye,
    color: "text-purple-400",
    templates: [
      {
        name: "Auditoría de Ads 360°",
        prompt: "Necesito una auditoría completa de mis campañas publicitarias. Plataforma: [plataforma]. Presupuesto mensual: [presupuesto]. Aquí están mis datos: [datos/screenshots].",
      },
      {
        name: "Diagnóstico de contenido",
        prompt: "Analiza mi contenido en redes sociales. Mis perfiles son: [URLs]. Últimos 30 días de actividad.",
      },
      {
        name: "Auditoría de marca",
        prompt: "Evalúa mi identidad de marca. Logo: [descripción]. Materiales: [descripción]. Competencia: [competidores].",
      },
      {
        name: "Auditoría Web & CRO",
        prompt: "Audita mi sitio web: [URL]. Landing pages principales: [URLs]. Quiero mejorar conversiones.",
      },
      {
        name: "Check-up integral",
        prompt: "Necesito un check-up integral de todo: ads, contenido, marca y sitio web. Aquí está mi información: [datos completos].",
      },
    ],
  },
};

export default function AgentChatPage() {
  const params = useParams();
  const projectId = params.id as string;
  const agentType = params.type as AgentType;
  const agent = agentInfo[agentType];

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Agente no encontrado</p>
      </div>
    );
  }

  const Icon = agent.icon;

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="rounded-lg bg-muted p-2">
            <Icon className={`h-5 w-5 ${agent.color}`} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{agent.name}</h1>
            <p className="text-xs text-muted-foreground">
              {agent.description}
            </p>
          </div>
        </div>

        <ChatContainer projectId={projectId} agentType={agentType} />
      </div>

      {/* Templates sidebar */}
      <div className="w-72 shrink-0 border-l border-border pl-4 overflow-y-auto hidden lg:block">
        <h3 className="text-sm font-semibold mb-3">Templates</h3>
        <div className="space-y-2">
          {agent.templates.map((template) => (
            <Card
              key={template.name}
              className="cursor-pointer hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-3">
                <p className="text-sm font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {template.prompt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
