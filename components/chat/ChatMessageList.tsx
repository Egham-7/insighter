import type { ChatMessage } from "@/lib/types/chat";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { StreamingMessage } from "./StreamingMessage";
interface ChatMessageListProps {
  messages: ChatMessage[];
  streamingMessage: string;
  complete: (
    prompt: string,
    options?:
      | {
          /**
  An optional object of headers to be passed to the API endpoint.
   */
          headers?: Record<string, string> | Headers;
          /**
  An optional object to be passed to the API endpoint.
     */
          body?: object;
        }
      | undefined,
  ) => Promise<string | null | undefined>;
  isAnalyzing: boolean;
}

export function ChatMessageList({
  messages,
  streamingMessage,
  complete,
  isAnalyzing,
}: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {messages.map((message) => (
          <ChatMessageComponent
            complete={complete}
            key={message.id}
            message={message}
            isAnalyzing={isAnalyzing}
          />
        ))}

        <StreamingMessage content={streamingMessage} isLoading={isAnalyzing} />
      </div>
    </div>
  );
}
