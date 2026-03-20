import Anthropic from "@anthropic-ai/sdk";
import type { AgentType } from "@/lib/supabase/types";

export interface AgentConfig {
  name: string;
  type: AgentType;
  model: string;
  temperature: number;
  systemPrompt: string;
  icon: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class BaseAgent {
  protected config: AgentConfig;
  private client: Anthropic;

  constructor(config: AgentConfig) {
    this.config = config;
    this.client = new Anthropic();
  }

  getConfig(): AgentConfig {
    return this.config;
  }

  buildMessages(
    brandContext: Record<string, unknown>,
    conversationHistory: ChatMessage[],
    userMessage: string
  ): { system: string; messages: Anthropic.MessageParam[] } {
    const systemPrompt = this.config.systemPrompt.replace(
      "{{brand_context}}",
      JSON.stringify(brandContext, null, 2)
    );

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    return { system: systemPrompt, messages };
  }

  async chat(
    brandContext: Record<string, unknown>,
    conversationHistory: ChatMessage[],
    userMessage: string
  ): Promise<AsyncIterable<Anthropic.MessageStreamEvent>> {
    const { system, messages } = this.buildMessages(
      brandContext,
      conversationHistory,
      userMessage
    );

    const stream = this.client.messages.stream({
      model: this.config.model,
      max_tokens: 4096,
      temperature: this.config.temperature,
      system,
      messages,
    });

    return stream;
  }
}
