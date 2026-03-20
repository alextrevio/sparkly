"use client";

import { cn } from "@/lib/utils/cn";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 py-4",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {role === "assistant" && (
        <div className="shrink-0 rounded-lg bg-primary/10 p-2 h-fit">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
        {timestamp && (
          <p
            className={cn(
              "text-xs mt-2",
              role === "user"
                ? "text-primary-foreground/60"
                : "text-muted-foreground"
            )}
          >
            {new Date(timestamp).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
      {role === "user" && (
        <div className="shrink-0 rounded-lg bg-muted p-2 h-fit">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
