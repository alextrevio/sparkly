export interface Plan {
  id: string;
  name: string;
  description: string;
  priceMXN: number;
  priceUSD: number;
  credits: number;
  projects: number | "unlimited";
  agents: string;
  members: number;
  features: string[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Para explorar la plataforma",
    priceMXN: 0,
    priceUSD: 0,
    credits: 50,
    projects: 1,
    agents: "2 básicos",
    members: 1,
    features: [
      "50 créditos/mes",
      "1 proyecto",
      "2 agentes básicos",
      "1 miembro",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    description: "Para negocios en crecimiento",
    priceMXN: 499,
    priceUSD: 29,
    credits: 500,
    projects: 3,
    agents: "5 agentes",
    members: 2,
    features: [
      "500 créditos/mes",
      "3 proyectos",
      "5 agentes completos",
      "2 miembros",
      "Templates premium",
      "Export PDF/DOCX",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para equipos de marketing",
    priceMXN: 1499,
    priceUSD: 89,
    credits: 2000,
    projects: 10,
    agents: "5 + premium",
    members: 5,
    features: [
      "2,000 créditos/mes",
      "10 proyectos",
      "Todos los agentes + premium",
      "5 miembros",
      "Templates premium",
      "Export PDF/DOCX",
      "API access",
    ],
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    description: "Para agencias y equipos grandes",
    priceMXN: 3999,
    priceUSD: 229,
    credits: 10000,
    projects: "unlimited",
    agents: "Todos + custom",
    members: 15,
    features: [
      "10,000 créditos/mes",
      "Proyectos ilimitados",
      "Todos los agentes + custom",
      "15 miembros",
      "Templates premium + custom",
      "Export PDF/DOCX",
      "API access",
      "Soporte prioritario",
    ],
  },
];
