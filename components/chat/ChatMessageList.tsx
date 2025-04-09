import type { ChatMessage } from "@/lib/types/chat";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {messages.map((message) => (
          <ChatMessageComponent key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
