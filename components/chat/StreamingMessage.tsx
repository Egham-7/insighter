import { cn } from "@/lib/utils";
import MarkdownRenderer from "../MarkdownRenderer";
import LoadingIndicator from "../LoadingIndicator";

interface StreamingMessageProps {
  content?: string;
  className?: string;
  isLoading: boolean;
}

export function StreamingMessage({
  content,
  className,
  isLoading,
}: StreamingMessageProps) {
  if (isLoading)
    return (
      <div className="px-6 py-4 text-gray-900 dark:text-foreground">
        <LoadingIndicator />
      </div>
    );

  if (!content) return null;

  return (
    <div className={cn("mb-4", className)}>
      <div className="px-6 py-4 text-gray-900 dark:text-foreground">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}
