"use client";

import type React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FileAttachment } from "@/lib/types/chat";
import { FileType } from "@/lib/types/chat";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput, type FileWithPath } from "./ChatInput";
import { useCreateChatMessage } from "@/hooks/chat/useCreateChatMessage";
import useParseFile from "@/hooks/parsers/useParseFile";
import { useGetChatMessages } from "@/hooks/chat/useGetChatMessages";
import { useState } from "react";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { useCompletion } from "@ai-sdk/react";
import { ChatHeader } from "./ChatHeader";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@clerk/nextjs";
import { useGetChat } from "@/hooks/chat/useGetChat";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export function ChatForm({
  className,
  chatId,
  ...props
}: React.ComponentProps<"div"> & { chatId: number }) {
  const [attachedFiles, setAttachedFiles] = useState<FileWithPath[]>([]);
  const {
    data: messages,
    isLoading,
    isError: isChatMessagesError,
  } = useGetChatMessages(chatId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const { user, isLoaded, isSignedIn } = useUser();

  const { mutateAsync: createChatMessage } = useCreateChatMessage();
  const { data: chat, isError: isChatError } = useGetChat(chatId);
  const { mutateAsync: parseFile } = useParseFile();

  const isError = isChatMessagesError || isChatError || !chat;

  const {
    completion,
    complete,
    isLoading: isAnalyzing,
    setCompletion,
    stop,
  } = useCompletion({
    api: "/api/chat",
    onFinish: async (_prompt: string, completion) => {
      await createChatMessage({
        role: "assistant",
        content: completion,
        timestamp: Date.now(),
        chat_id: chatId,
      });
      setCompletion("");
    },
    onError: (error) => {
      console.error("Error in completion:", error);
      toast.error("Error analyzing data", {
        description: error.message || "Unknown error",
      });
    },
  });
  console.log(completion);
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Prepare files for processing
      const filesToProcess = [...attachedFiles];
      setAttachedFiles([]);

      // Reset form immediately for better UX
      form.reset();

      // Process files first if there are any
      let attachments: FileAttachment[] = [];
      let dataAttachments: string[] = [];

      if (filesToProcess.length > 0) {
        const loadingToast = toast.loading("Processing attached files...");

        try {
          // Process files to get their data
          attachments = await Promise.all(
            filesToProcess.map(async (file) => {
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
                chat_message_id: 0, // This will be set by the backend
                id: 0,
              };
            }),
          );

          dataAttachments = attachments.map((att) => att.data);
          toast.dismiss(loadingToast);
        } catch (error) {
          toast.dismiss(loadingToast);
          toast.error("Error processing files", {
            description:
              error instanceof Error
                ? error.message
                : "Failed to process attached files",
            dismissible: true,
          });
          throw error;
        }
      }

      // Create user message with attachments in a single call
      await createChatMessage({
        role: "user",
        content: values.message,
        timestamp: Date.now(),
        chat_id: chatId,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      toast.success("Message sent successfully");

      if (!user) return;

      // Start the completion with the data attachments
      await complete(values.message, {
        body: {
          inputData: dataAttachments.length > 0 ? dataAttachments : null,
          resourceId: user.id,
          threadId: chatId,
        },
      });
    } catch (error) {
      console.error("Error in submission:", error);

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

  if (isLoading || !isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-md mx-auto mt-8 w-full">
        <Alert variant="destructive">
          <AlertTitle className="text-destructive font-medium">
            Error loading messages
          </AlertTitle>
          <AlertDescription className="mt-2">
            We couldn&apos;t load your chat messages. Please try refreshing the
            page or check your connection.
          </AlertDescription>
        </Alert>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <TooltipProvider>
      <main
        className={cn(
          "flex w-full flex-col items-stretch bg-background",
          className,
        )}
        {...props}
      >
        <ChatHeader chatTitle={chat.title} chatId={chat.id} />

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Messages */}
          <div className=" w-full overflow-y-auto">
            <ChatMessageList
              messages={messages ?? []}
              streamingMessage={completion}
              complete={complete}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>

        <Form {...form}>
          <ChatInput
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || isAnalyzing}
            attachedFiles={attachedFiles}
            stop={stop}
            onAddFiles={addFiles}
            onRemoveFile={removeFile}
            handleKeyDown={handleKeyDown}
          />
        </Form>
      </main>
    </TooltipProvider>
  );
}
