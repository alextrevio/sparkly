import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Target,
  Brain,
  Palette,
  ScanEye,
  ArrowRight,
  Check,
  Zap,
  MessageSquare,
} from "lucide-react";
import { PLANS } from "@/lib/stripe/plans";

const agents = [
  {
    name: "Ads Expert",
    description:
      "Crea campañas optimizadas para Meta, Google y TikTok Ads con métricas estimadas y presupuestos.",
    icon: Target,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    name: "Content Creator",
    description:
      "Genera copy para redes, calendarios editoriales, emails, landing pages y scripts de video.",
    icon: Sparkles,
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
  },
  {
    name: "Estratega Digital",
    description:
      "Planes de marketing, análisis competitivo, buyer personas y growth roadmaps basados en datos.",
    icon: Brain,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    name: "Brand Designer",
    description:
      "Brand boards, guías de estilo, identidad visual y naming con especificaciones técnicas.",
    icon: Palette,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  {
    name: "Consultor Sparkli",
    description:
      "Auditorías de ads, contenido, marca y sitio web con score, quick wins y roadmap de mejora.",
    icon: ScanEye,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-gradient">Sparkli</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">
                Empieza gratis
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm px-4 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            Tu agencia de publicidad con IA
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Un equipo completo de marketing{" "}
            <span className="text-gradient">al alcance de tu mano</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            5 agentes de IA especializados que trabajan como tu agencia de
            publicidad. Estrategia, contenido, ads, branding y auditorías por
            una fracción del costo.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="text-base px-8">
                Empieza gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              50 créditos gratis &middot; Sin tarjeta
            </p>
          </div>
        </div>
      </section>

      {/* Agents */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Tu equipo de IA</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cada agente es un especialista con años de experiencia en su área,
              optimizado para el mercado LATAM.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card
                key={agent.name}
                className="hover:border-primary/30 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`rounded-lg p-2.5 ${agent.bgColor}`}>
                      <agent.icon className={`h-5 w-5 ${agent.color}`} />
                    </div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {agent.description}
                  </p>
                </CardContent>
              </Card>
            ))}
            {/* CTA card */}
            <Card className="border-dashed border-primary/30 flex items-center justify-center">
              <CardContent className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">
                  Y trabajan en equipo
                </p>
                <p className="text-xs text-muted-foreground">
                  Los agentes comparten contexto y se referencian entre sí
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 bg-muted/30 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Agencia tradicional vs Sparkli
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Agencia tradicional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>$3,000 - $50,000 USD/mes</p>
                <p>Tiempos de entrega de días a semanas</p>
                <p>Equipo limitado, rotación de personal</p>
                <p>Comunicación por email y juntas</p>
                <p>Horario de oficina únicamente</p>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Sparkli</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Desde $0 hasta $229 USD/mes
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Respuestas en segundos
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  5 especialistas disponibles siempre
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Chat directo con cada agente
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  24/7, sin esperas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 border-t border-border" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Planes y precios</h2>
            <p className="text-muted-foreground">
              Empieza gratis. Escala cuando estés listo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={plan.popular ? "border-primary relative" : ""}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Más popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="pt-2">
                    <span className="text-4xl font-bold">
                      ${plan.priceUSD}
                    </span>
                    <span className="text-muted-foreground"> /mes</span>
                    {plan.priceMXN > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
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
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.priceUSD === 0 ? "Empieza gratis" : "Comenzar"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Tu agencia de publicidad con IA te espera
          </h2>
          <p className="text-muted-foreground mb-8">
            50 créditos gratis para probar todos los agentes. Sin tarjeta de
            crédito. Cancela cuando quieras.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="text-base px-8">
              Crear cuenta gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-gradient">Sparkli</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sparkli. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
