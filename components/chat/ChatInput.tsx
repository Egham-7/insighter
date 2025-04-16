import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AutoResizeTextarea } from "../AutoResizeTextArea";
import { FileAttachments } from "./FileAttachments";
import { toast } from "sonner";
import { open } from "@tauri-apps/plugin-dialog";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export type FileWithPath = {
  name: string;
  path: string;
  data?: ArrayBuffer;
};

const ALLOWED_FILE_TYPES = [".csv", ".pdf"];

interface ChatInputProps {
  form: UseFormReturn<{ message: string }>;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  isSubmitting: boolean;
  attachedFiles: FileWithPath[];
  onAddFiles: (files: FileWithPath[]) => void;
  onRemoveFile: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  stop: () => void;
}

export function ChatInput({
  form,
  onSubmit,
  isSubmitting,
  attachedFiles,
  onAddFiles,
  onRemoveFile,
  handleKeyDown,
  stop,
}: ChatInputProps) {
  const validateFiles = (files: FileWithPath[]): boolean => {
    return files.every((file) =>
      ALLOWED_FILE_TYPES.some((type) => file.name.endsWith(type))
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

      if (!validateFiles(newFiles)) {
        toast.error("Invalid files", {
          description: "Only CSV and PDF files are allowed",
        });
        return;
      }

      onAddFiles(newFiles);
    } catch (error) {
      console.error("Error selecting files:", error);
      toast.error("Failed to select files", {
        description: "There was an error opening the file picker.",
      });
    }
  };

  return (
    <div className="border-t bg-background px-4 py-4">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl"
      >
        <FileAttachments files={attachedFiles} onRemoveFile={onRemoveFile} />
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
            <TooltipContent>Attach CSV or PDF files</TooltipContent>
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

          {isSubmitting ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={stop}
                  className="absolute bottom-3 right-3 h-10 w-10 rounded-full"
                >
                  <Square size={16} className="fill-current" />
                  <span className="sr-only">Stop generation</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop generation</TooltipContent>
            </Tooltip>
          ) : (
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
          )}
        </div>
      </form>
    </div>
  );
}
