"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgentType } from "@/lib/supabase/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatContainerProps {
  projectId: string;
  agentType: AgentType;
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

export function ChatContainer({
  projectId,
  agentType,
  conversationId,
  onConversationCreated,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (currentConvId) {
      loadMessages();
    }
  }, [currentConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function loadMessages() {
    if (!currentConvId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", currentConvId)
      .neq("role", "system")
      .order("created_at", { ascending: true });

    if (data) {
      const rows = data as { id: string; role: string; content: string; created_at: string }[];
      setMessages(
        rows.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          created_at: m.created_at,
        }))
      );
    }
  }

  async function handleSend(content: string) {
    setLoading(true);
    setStreaming(true);

    // Optimistically add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Add placeholder for assistant
    const assistantMsgId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      const response = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          agentType,
          conversationId: currentConvId,
          message: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar mensaje");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream available");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.conversationId && !currentConvId) {
                setCurrentConvId(parsed.conversationId);
                onConversationCreated?.(parsed.conversationId);
              }

              if (parsed.content) {
                fullContent += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  error instanceof Error
                    ? `Error: ${error.message}`
                    : "Error al procesar tu mensaje. Intenta de nuevo.",
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-lg mb-2">
              Inicia una conversación
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              Escribe tu mensaje o selecciona un template para empezar.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.created_at}
          />
        ))}

        {streaming &&
          messages[messages.length - 1]?.role === "assistant" &&
          messages[messages.length - 1]?.content === "" && (
            <div className="flex gap-3 py-4">
              <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="space-y-2 max-w-[60%]">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          )}
      </div>

      <ChatInput onSend={handleSend} loading={loading} />
    </div>
  );
}
