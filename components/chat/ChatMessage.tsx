import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  RotateCcw,
  Copy as CopyIcon,
  Check,
  Download,
} from "lucide-react";
import { EditMessageForm } from "./EditMessageForm";
import useDeleteChatMessage from "@/hooks/chat/useDeleteChatMessage";
import MarkdownRenderer from "../MarkdownRenderer";
import { useUpdateChatMessage } from "@/hooks/chat/useUpdateChatMessage";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { downloadDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";

interface ChatMessageProps {
  message: ChatMessageType;
  complete: (
    prompt: string,
    options?:
      | {
          headers?: Record<string, string> | Headers;
          body?: object;
        }
      | undefined,
  ) => Promise<string | null | undefined>;
  isAnalyzing: boolean;
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 rounded-full"
      onClick={handleCopy}
      title="Copy"
      aria-label="Copy message"
    >
      {copied ? <Check size={14} /> : <CopyIcon size={14} />}
      <span className="sr-only">Copy message</span>
    </Button>
  );
}

function ExportPDFButton({ message }: { message: ChatMessageType }) {
  const handleExportPDF = async () => {
    try {
      const downloadsPath = await downloadDir();
      const fileName = `message-${message.id}.pdf`;
      const filePath = `${downloadsPath}/${fileName}`;

      await invoke("markdown_to_pdf", {
        message: message.content,
        pdfPath: filePath,
      });

      toast.success(`PDF exported to Downloads as ${fileName}`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Could not export PDF");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 rounded-full"
      onClick={handleExportPDF}
      title="Export as PDF"
      aria-label="Export as PDF"
    >
      <Download size={14} />
      <span className="sr-only">Export as PDF</span>
    </Button>
  );
}

function AIMessageActions({ message }: { message: ChatMessageType }) {
  return (
    <div className="ml-4 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0">
      <CopyButton content={message.content} />
      <ExportPDFButton message={message} />
    </div>
  );
}

// Message Action Buttons Component for user messages
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
        <CopyButton content={messageContent} />
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
    <div className="mb-6 flex flex-col w-full group relative">
      <div className="flex-1">
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
      <AIMessageActions message={message} />
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
          <MarkdownRenderer content={message.content} />
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
        <div className="flex justify-end mt-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}
