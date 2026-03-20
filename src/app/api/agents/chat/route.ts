import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAgentConfig } from "@/lib/agents";
import { buildBrandContext } from "@/lib/utils/brand-context";
import { calculateCreditCost, hasEnoughCredits, deductCredits } from "@/lib/utils/credits";
import type { AgentType, MessageRole, Database } from "@/lib/supabase/types";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const {
    projectId,
    agentType,
    conversationId,
    message,
  }: {
    projectId: string;
    agentType: AgentType;
    conversationId?: string;
    message: string;
  } = body;

  // Validate agent type
  let agentCfg;
  try {
    agentCfg = getAgentConfig(agentType);
  } catch {
    return Response.json({ error: "Agente no válido" }, { status: 400 });
  }

  // Get org membership
  const { data: memberships } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id);

  if (!memberships?.length) {
    return Response.json({ error: "Sin organización" }, { status: 403 });
  }

  const orgId = memberships[0].org_id;

  // Check credits
  const enoughCredits = await hasEnoughCredits(orgId, agentType);
  if (!enoughCredits) {
    return Response.json(
      { error: "Sin créditos suficientes. Actualiza tu plan." },
      { status: 402 }
    );
  }

  // Load project and brand context
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
  const typedProject = project as ProjectRow | null;
  if (!typedProject) {
    return Response.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const brandContext = buildBrandContext(typedProject);

  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({
        project_id: projectId,
        agent_type: agentType,
        title: message.slice(0, 100),
      })
      .select()
      .single();

    const conv = newConv as { id: string } | null;
    if (!conv) {
      return Response.json(
        { error: "Error al crear conversación" },
        { status: 500 }
      );
    }
    convId = conv.id;
  }

  // Save user message
  await supabase.from("messages").insert({
    conversation_id: convId,
    role: "user" as MessageRole,
    content: message,
  });

  // Load conversation history
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })
    .limit(20);

  // Build system prompt with brand context
  const systemPrompt = agentCfg.systemPrompt
    .replace("{{brand_context}}", JSON.stringify(brandContext, null, 2))
    .replace("{{client_data}}", "");

  // Build messages for Claude
  const claudeMessages = (history ?? [])
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  // Stream response from Claude
  const anthropic = new Anthropic();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send conversation ID first
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ conversationId: convId })}\n\n`
          )
        );

        let fullResponse = "";

        const messageStream = anthropic.messages.stream({
          model: agentCfg.model,
          max_tokens: 4096,
          temperature: agentCfg.temperature,
          system: systemPrompt,
          messages: claudeMessages,
        });

        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ content: text })}\n\n`
              )
            );
          }
        }

        // Get final message for token counts
        const finalMessage = await messageStream.finalMessage();
        const tokensInput = finalMessage.usage?.input_tokens ?? 0;
        const tokensOutput = finalMessage.usage?.output_tokens ?? 0;

        // Save assistant message
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant" as MessageRole,
          content: fullResponse,
          tokens_used: tokensInput + tokensOutput,
        });

        // Deduct credits (also logs usage internally)
        await deductCredits(orgId, agentType, tokensInput, tokensOutput, convId);

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: errorMessage })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
