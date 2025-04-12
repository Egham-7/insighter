import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, RotateCcw } from "lucide-react";
import { EditMessageForm } from "./EditMessageForm";
import useDeleteChatMessage from "@/hooks/chat/useDeleteChatMessage";
import MarkdownRenderer from "../MarkdownRenderer";
import { useUpdateChatMessage } from "@/hooks/chat/useUpdateChatMessage";

interface ChatMessageProps {
  message: ChatMessageType;
  complete: (
    prompt: string,
    options?:
      | {
          /**
           * An optional object of headers to be passed to the API endpoint.
           */
          headers?: Record<string, string> | Headers;
          /**
           * An optional object to be passed to the API endpoint.
           */
          body?: object;
        }
      | undefined,
  ) => Promise<string | null | undefined>;
}

// Message Action Buttons Component
function MessageActions({
  messageId,
  messageContent,
  onEdit,
  onDelete,
  onRetry,
}: {
  messageId: number;
  messageContent: string;
  onEdit: () => void;
  onDelete: (id: number) => Promise<void>;
  onRetry: (content: string) => void;
}) {
  return (
    <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-full"
          onClick={() => onRetry(messageContent)}
          title="Retry"
        >
          <RotateCcw size={14} />
          <span className="sr-only">Retry message</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-full"
          onClick={onEdit}
          title="Edit"
        >
          <Edit size={14} />
          <span className="sr-only">Edit message</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-full text-destructive hover:text-destructive/90"
          onClick={() => onDelete(messageId)}
          title="Delete"
        >
          <Trash2 size={14} />
          <span className="sr-only">Delete message</span>
        </Button>
      </div>
    </div>
  );
}

export function ChatMessage({ message, complete }: ChatMessageProps) {
  if (message.role === "assistant") {
    return <AIMessage message={message} />;
  } else {
    return <UserMessage message={message} complete={complete} />;
  }
}

function AIMessage({ message }: { message: ChatMessageType }) {
  return (
    <div className="mb-6 flex w-full">
      <div className="max-w-[80%]">
        <div className="rounded-2xl bg-muted p-4">
          <MarkdownRenderer content={message.content} />
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.attachments.map((attachment, i) => (
                <div
                  key={i}
                  className="relative h-24 w-24 overflow-hidden rounded-lg border"
                >
                  <Image
                    src={"/images/csv.png"}
                    alt={attachment.file_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserMessage({
  message,
  complete,
}: {
  message: ChatMessageType;
  complete: ChatMessageProps["complete"];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: deleteChatMessage } = useDeleteChatMessage();
  const { mutateAsync: updateChatMessage } = useUpdateChatMessage();

  const handleDelete = async (id: number) => {
    await deleteChatMessage(id);
  };

  const handleRetry = (content: string) => {
    updateChatMessage({
      id: message.id,
      updates: { ...message, content },
    });
  };

  if (isEditing) {
    return (
      <EditMessageForm
        message={message}
        onCancel={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
        complete={complete}
      />
    );
  }

  return (
    <div className="mb-6 flex flex-col group items-end">
      <div className="max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            "bg-primary text-primary-foreground",
          )}
        >
          <p className="text-sm">{message.content}</p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.attachments.map((attachment, i) => (
                <div
                  key={i}
                  className="relative h-24 w-24 overflow-hidden rounded-lg border"
                >
                  <Image
                    src={"/images/csv.png"}
                    alt={attachment.file_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <MessageActions
          messageId={message.id}
          messageContent={message.content}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}
