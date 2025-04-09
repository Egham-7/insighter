import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { createChatMessage } from "@/lib/actions/chat";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
  files: z.any().optional(),
});
export function ChatInput() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      files: null,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const file_paths = files ? Array.from(files).map((file) => file.name) : [];
    createChatMessage("user", values.message, Date.now(), file_paths);
    setFiles(undefined);
    form.reset();
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="border-t bg-background px-4 py-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-3xl"
        >
          <FileAttachments
            files={files}
            onRemoveFiles={() => setFiles(undefined)}
          />
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
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setFiles(e.target.files || undefined)}
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
  );
}
