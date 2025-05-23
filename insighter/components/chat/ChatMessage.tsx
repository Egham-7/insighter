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
  DownloadIcon,
} from "lucide-react";
import { AiFillFileWord } from "react-icons/ai";
import { SiMarkdown } from "react-icons/si";
import { FaFilePdf } from "react-icons/fa";
import { EditMessageForm } from "./EditMessageForm";
import useDeleteChatMessage from "@/hooks/chat/useDeleteChatMessage";
import MarkdownRenderer from "../MarkdownRenderer";
import { useUpdateChatMessage } from "@/hooks/chat/useUpdateChatMessage";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { writeFile, BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import { markdownToDocx } from "@/lib/exporters/docx";
import { invoke } from "@tauri-apps/api/core";
import { downloadDir } from "@tauri-apps/api/path";
import { preprocessMarkdownWithMermaid } from "@/lib/utils/mermaid";

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

async function exportMarkdownToDownloads(content: string) {
  try {
    const title = content.split("\n")[0].replace(/^#\s*/, "");
    await writeTextFile(`${title}.md`, content, {
      baseDir: BaseDirectory.Download,
    });
    toast.success("Markdown file saved to Downloads!");
  } catch (err) {
    toast.error("Failed to save Markdown file.");
    console.error(err);
  }
}

async function exportMarkdownToPdf(content: string) {
  try {
    const downloadDirectory = await downloadDir();
    const preprocessedMarkdown = await preprocessMarkdownWithMermaid(content);
    // First Heading in markdown is used as the title
    const title = content.split("\n")[0].replace(/^#\s*/, "");

    await invoke("markdown_to_pdf", {
      markdown: preprocessedMarkdown,
      outputPath: `${downloadDirectory}/${title}`,
    });
    toast.success("PDF file saved to Downloads!");
  } catch (err) {
    toast.error("Failed to save as PDF file.");
    console.error(err);
  }
}

async function exportDocxToDownloads(content: string) {
  try {
    const buffer = await markdownToDocx(content);
    const title = content.split("\n")[0].replace(/^#\s*/, "");

    await writeFile(`${title}.docx`, buffer, {
      baseDir: BaseDirectory.Download,
    });
    toast.success("DOCX file saved to Downloads!");
  } catch (err) {
    toast.error("Failed to save DOCX file.");
    console.error(err);
  }
}

function ExportDropdownMenu({ content }: { content: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-full"
          title="Export"
          aria-label="Export"
        >
          <DownloadIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex gap-1 p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem
              className="p-0 w-8 h-8 flex items-center justify-center"
              onClick={() => exportMarkdownToDownloads(content)}
            >
              <SiMarkdown className="h-5 w-5" />
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent side="left">Export as Markdown</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem
              className="p-0 w-8 h-8 flex items-center justify-center"
              onClick={() => exportDocxToDownloads(content)}
            >
              <AiFillFileWord className="h-5 w-5 text-blue-600" />
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent side="left">Export as DOCX</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem
              className="p-0 w-8 h-8 flex items-center justify-center"
              onClick={() => exportMarkdownToPdf(content)}
            >
              <FaFilePdf className="h-5 w-5 text-red-600" />
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent side="left">Export as PDF</TooltipContent>
        </Tooltip>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AIMessageActions({ message }: { message: ChatMessageType }) {
  return (
    <div className="ml-4 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <CopyButton content={message.content} />
      <ExportDropdownMenu content={message.content} />
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
      <div className="flex-1" id={`message-content-${message.id}`}>
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
          className={cn("rounded-2xl px-4 py-3", " text-primary-foreground")}
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
