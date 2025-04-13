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
import { useUser } from "@clerk/nextjs";

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
  isAnalyzing: boolean;
}

// Message Action Buttons Component
function MessageActions({
  messageId,
  messageContent,
  onEdit,
  onDelete,
  onRetry,
  isLoading,
}: {
  messageId: number;
  messageContent: string;
  onEdit: () => void;
  onDelete: (id: number) => Promise<void>;
  onRetry: (content: string) => void;
  isLoading: boolean;
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
          disabled={isLoading}
        >
          <RotateCcw size={14} className={cn(isLoading && "animate-spin")} />

          <span className="sr-only">Retry message</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-full"
          onClick={onEdit}
          title="Edit"
          disabled={isLoading}
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
          disabled={isLoading}
        >
          <Trash2 size={14} />
          <span className="sr-only">Delete message</span>
        </Button>
      </div>
    </div>
  );
}

export function ChatMessage({
  message,
  complete,
  isAnalyzing,
}: ChatMessageProps) {
  if (message.role === "assistant") {
    return <AIMessage message={message} />;
  } else {
    return (
      <UserMessage
        message={message}
        complete={complete}
        isAnalyzing={isAnalyzing}
      />
    );
  }
}

function AIMessage({ message }: { message: ChatMessageType }) {
  return (
    <div className="mb-6 flex w-full px-12">
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
  );
}

function UserMessage({
  message,
  complete,
  isAnalyzing,
}: {
  message: ChatMessageType;
  complete: ChatMessageProps["complete"];
  isAnalyzing: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: deleteChatMessage, isPending: isDeleting } =
    useDeleteChatMessage();
  const { mutateAsync: updateChatMessage, isPending: isUpdating } =
    useUpdateChatMessage();
  const { user, isLoaded, isSignedIn } = useUser();

  const handleDelete = async (id: number) => {
    await deleteChatMessage(id);
  };

  const handleRetry = (content: string) => {
    if (!user || !isSignedIn) return;
    updateChatMessage({
      id: message.id,
      updates: { ...message, content },
    });

    const attachments = message.attachments?.map((att) => att.data);
    complete(content, {
      body: {
        inputData: attachments && attachments.length > 0 ? attachments : null,
        resourceId: user.id,
        threadId: message.chat_id,
      },
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

  const isLoading = isAnalyzing || isUpdating || isDeleting || !isLoaded;

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
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
