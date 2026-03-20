import type { AgentType } from "@/lib/supabase/types";
import { BaseAgent, type AgentConfig } from "./base-agent";
import { adsExpertConfig } from "./ads-expert";
import { contentCreatorConfig } from "./content-creator";
import { strategistConfig } from "./strategist";
import { brandDesignerConfig } from "./brand-designer";
import { consultorConfig } from "./consultor";

export { BaseAgent, type AgentConfig } from "./base-agent";
export { adsExpertConfig } from "./ads-expert";
export { contentCreatorConfig } from "./content-creator";
export { strategistConfig } from "./strategist";
export { brandDesignerConfig } from "./brand-designer";
export { consultorConfig } from "./consultor";

const agentConfigs: Record<AgentType, AgentConfig> = {
  ads_expert: adsExpertConfig,
  content_creator: contentCreatorConfig,
  strategist: strategistConfig,
  brand_designer: brandDesignerConfig,
  consultor: consultorConfig,
};

export function getAgent(type: AgentType): BaseAgent {
  const config = agentConfigs[type];
  if (!config) {
    throw new Error(`Unknown agent type: ${type}`);
  }
  return new BaseAgent(config);
}

export function getAgentConfig(type: AgentType): AgentConfig {
  const config = agentConfigs[type];
  if (!config) {
    throw new Error(`Unknown agent type: ${type}`);
  }
  return config;
}

export function getAllAgentConfigs(): AgentConfig[] {
  return Object.values(agentConfigs);
}
