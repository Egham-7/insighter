"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types/chat";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

export function ChatForm({
  className,
  messages,
  ...props
}: React.ComponentProps<"div"> & { messages: ChatMessage[] }) {
  return (
    <TooltipProvider>
      <main
        className={cn(
          "flex h-svh max-h-svh w-full flex-col items-stretch bg-background",
          className,
        )}
        {...props}
      >
        <ChatMessageList messages={messages} />

        <ChatInput />
      </main>
    </TooltipProvider>
  );
}
