"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowUp, Paperclip } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AutoResizeTextarea } from "../AutoResizeTextArea";
import { useState } from "react";
import { FileAttachments } from "./FileAttachments";
import { useCreateChatMessage } from "@/hooks/chat/useCreateChatMessage";
import useParseFile from "@/hooks/parsers/useParseFile";
import { FileAttachment, FileType } from "@/lib/types/chat";
import { useUpdateChatMessage } from "@/hooks/chat/useUpdateChatMessage";
import { toast } from "sonner";
import { open } from "@tauri-apps/plugin-dialog";
import useDeleteChatMessage from "@/hooks/chat/useDeleteChatMessage";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export type FileWithPath = {
  name: string;
  path: string;
  data?: ArrayBuffer;
};

const ALLOWED_FILE_TYPES = [".csv", ".pdf"];

export function ChatInput() {
  const [attachedFiles, setAttachedFiles] = useState<FileWithPath[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting || isProcessing;
  const { mutateAsync: createChatMessage } = useCreateChatMessage();
  const { mutateAsync: parseFile } = useParseFile();
  const { mutateAsync: updateChatMessage } = useUpdateChatMessage();
  const { mutateAsync: deleteChatMessage } = useDeleteChatMessage();

  const validateFiles = (files: FileWithPath[]): boolean => {
    return files.every((file) =>
      ALLOWED_FILE_TYPES.some((type) => file.name.endsWith(type)),
    );
  };

  const handleOpenFilePicker = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          { name: "CSV", extensions: ["csv"] },
          { name: "PDF", extensions: ["pdf"] },
        ],
      });

      if (selected === null) {
        // User cancelled the selection
        return;
      }

      const filePaths = Array.isArray(selected) ? selected : [selected];

      const newFiles: FileWithPath[] = filePaths.map((path) => {
        const name =
          path.split("/").pop() || path.split("\\").pop() || "unknown.csv";
        return { name, path };
      });

      setAttachedFiles((prev) => [...prev, ...newFiles]);
    } catch (error) {
      console.error("Error selecting files:", error);
      toast.error("Failed to select files", {
        description: "There was an error opening the file picker.",
      });
    }
  };

  async function processFiles(
    files: FileWithPath[],
    messageId: number,
  ): Promise<FileAttachment[]> {
    return Promise.all(
      files.map(async (file) => {
        const data = await parseFile(file.path);
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        const fileTypeEnum =
          Object.values(FileType).find(
            (type) => type.toLowerCase() === fileExtension,
          ) || FileType.CSV;

        return {
          file_name: file.name,
          file_type: fileTypeEnum,
          data: JSON.stringify(data),
          chat_message_id: messageId,
        };
      }),
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (attachedFiles.length > 0 && !validateFiles(attachedFiles)) {
      toast.error("Invalid files", {
        description: "Only CSV files are allowed",
      });
      return;
    }

    try {
      // Create message first
      const chatMessage = await createChatMessage({
        role: "user",
        content: values.message,
        timestamp: Date.now(),
      });

      // Reset form immediately to improve perceived performance
      form.reset();

      // Process files if there are any
      if (attachedFiles.length > 0) {
        setIsProcessing(true);
        const filesToProcess = [...attachedFiles]; // Create a copy before clearing
        setAttachedFiles([]);

        const loadingToast = toast.loading("Processing attached files...");

        try {
          const attachments = await processFiles(
            filesToProcess,
            chatMessage.id,
          );

          // Update message with attachments
          await updateChatMessage({
            id: chatMessage.id,
            updates: { ...chatMessage, attachments },
          });

          toast.dismiss(loadingToast);
          toast.success(`${attachments.length} file(s) attached successfully`);
        } catch (error) {
          await deleteChatMessage(chatMessage.id);

          toast.dismiss(loadingToast);
          toast.error("Error processing files", {
            description:
              error instanceof Error
                ? error.message
                : "Failed to process attached files",
          });
        } finally {
          setIsProcessing(false);
        }
      }
    } catch (error) {
      toast.error("Error sending message", {
        description: "Failed to send your message. Please try again.",
      });
      console.error("Error sending message:", error);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-background px-4 py-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-3xl"
        >
          <FileAttachments files={attachedFiles} onRemoveFile={removeFile} />
          <div className="relative rounded-2xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenFilePicker}
                  disabled={isSubmitting}
                  className="absolute bottom-3 left-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-muted"
                >
                  <Paperclip
                    size={20}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  />
                  <span className="sr-only">Attach files</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach CSV files</TooltipContent>
            </Tooltip>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <AutoResizeTextarea
                      {...field}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="min-h-32 w-full resize-none bg-transparent px-14 py-4 placeholder:text-muted-foreground focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer"
                  disabled={isSubmitting}
                >
                  <ArrowUp size={18} />
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
        </form>
      </Form>
    </div>
  );
}
