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
import { useCompletion } from "@ai-sdk/react";
import { ChatHeader } from "./ChatHeader";

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

  const {
    completion,
    complete,
    isLoading: isAnalyzing,
    setCompletion,
  } = useCompletion({
    api: "/api/chat",
    onFinish: async (_prompt: string, completion) => {
      await createChatMessage({
        role: "assistant",
        content: completion,
        timestamp: Date.now(),
      });
      setCompletion("");
    },
    onError: (error) => {
      toast.error("Error analyzing data", {
        description: error.message || "Unknown error",
      });
    },
  });

  console.log("completion", completion);

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

  async function handleFileProcessing(
    files: FileWithPath[],
    messageId: number,
  ) {
    const loadingToast = toast.loading("Processing attached files...");

    try {
      const attachments = await processFiles(files, messageId);

      // Update message with attachments
      await updateChatMessage({
        id: messageId,
        updates: { id: messageId, attachments },
      });

      toast.dismiss(loadingToast);
      toast.success(`${attachments.length} file(s) attached successfully`);

      return attachments;
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error processing files", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to process attached files",
      });
      throw error; // Re-throw to handle in the calling function
    }
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    let userMessageId: number | null = null;

    try {
      // Create user message
      const chatMessage = await createChatMessage({
        role: "user",
        content: values.message,
        timestamp: Date.now(),
      });

      userMessageId = chatMessage.id;

      // Reset form immediately
      form.reset();

      // Process files if there are any
      const filesToProcess = [...attachedFiles];
      setAttachedFiles([]);

      const attachments = await handleFileProcessing(
        filesToProcess,
        chatMessage.id,
      );
      const dataAttachments = attachments.map((att) => att.data);

      // Start the completion with the data attachments
      await complete("Analyze this data and provide insights", {
        body: {
          inputData: dataAttachments,
          messages: messages,
          prompt: values.message,
        },
      });
    } catch (error) {
      console.error("Error in submission:", error);

      // Clean up the user message if it was created but processing failed
      if (userMessageId) {
        await deleteChatMessage(userMessageId).catch(console.error);
      }

      toast.error("Error sending message", {
        description: "Failed to send your message. Please try again.",
        dismissible: true,
      });
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
        <ChatHeader />
        <ChatMessageList
          messages={messages}
          streamingMessage={completion}
          complete={complete}
        />

        <Form {...form}>
          <ChatInput
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || isAnalyzing}
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
