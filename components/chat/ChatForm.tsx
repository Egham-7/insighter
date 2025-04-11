"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ChatMessage, FileAttachment } from "@/lib/types/chat";
import { FileType } from "@/lib/types/chat";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput, FileWithPath } from "./ChatInput";
import { useCreateChatMessage } from "@/hooks/chat/useCreateChatMessage";
import useParseFile from "@/hooks/parsers/useParseFile";
import { useUpdateChatMessage } from "@/hooks/chat/useUpdateChatMessage";
import useDeleteChatMessage from "@/hooks/chat/useDeleteChatMessage";
import { useState } from "react";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export function ChatForm({
  className,
  messages,
  ...props
}: React.ComponentProps<"div"> & { messages: ChatMessage[] }) {
  const [attachedFiles, setAttachedFiles] = useState<FileWithPath[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const { mutateAsync: createChatMessage } = useCreateChatMessage();
  const { mutateAsync: parseFile } = useParseFile();
  const { mutateAsync: updateChatMessage } = useUpdateChatMessage();
  const { mutateAsync: deleteChatMessage } = useDeleteChatMessage();

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

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
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
        }
      }
    } catch (error) {
      toast.error("Error sending message", {
        description: "Failed to send your message. Please try again.",
      });
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      form.handleSubmit(handleSubmit)();
    }
  };

  const addFiles = (newFiles: FileWithPath[]) => {
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

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

        <Form {...form}>
          <ChatInput
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            attachedFiles={attachedFiles}
            onAddFiles={addFiles}
            onRemoveFile={removeFile}
            handleKeyDown={handleKeyDown}
          />
        </Form>
      </main>
    </TooltipProvider>
  );
}
