"use client";

import type React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AutoResizeTextarea } from "../AutoResizeTextArea";
import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import type { ChatMessage } from "@/lib/types/chat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
  files: z.any().optional(),
});

export function ChatForm({ className, ...props }: React.ComponentProps<"div">) {
  const [files, setFiles] = useState<FileList | null>(null);
  const messages: ChatMessage[] = [
    {
      role: "assistant",
      content: "Hello, how can I help you?",
      attachments: [],
      timestamp: Date.now(),
    },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      files: null,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setFiles(null);
    form.reset();
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
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
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto max-w-3xl">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "mb-4 flex",
                  message.role === "assistant"
                    ? "justify-start"
                    : "justify-end",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-6 py-4",
                    message.role === "assistant"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.attachments?.length > 0 && (
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
            ))}
          </div>
        </div>

        <div className="border-t bg-background px-4 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto max-w-3xl"
            >
              {files && files.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {Array.from(files).map((file, i) => (
                    <div
                      key={i}
                      className="relative rounded-lg border bg-muted/30 p-2"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => setFiles(null)}
                        size="icon"
                        variant="secondary"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                      >
                        <X size={12} />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative rounded-2xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label
                      htmlFor="file-upload"
                      className="absolute bottom-3 left-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-muted"
                    >
                      <Paperclip
                        size={20}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      />
                      <span className="sr-only">Attach files</span>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => setFiles(e.target.files)}
                      />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>Attach files</TooltipContent>
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
                      className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
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
      </main>
    </TooltipProvider>
  );
}
