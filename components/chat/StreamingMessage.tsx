import { cn } from "@/lib/utils";
import MarkdownRenderer from "../MarkdownRenderer";
interface StreamingMessageProps {
  content?: string;
  className?: string;
}

export function StreamingMessage({
  content,
  className,
}: StreamingMessageProps) {
  return (
    <div className={cn("mb-4 flex justify-start", className)}>
      <div className="max-w-[80%] rounded-2xl bg-gray-100 dark:bg-secondary px-6 py-4 text-gray-900 dark:text-foreground">
        {content && <MarkdownRenderer content={content} />}
        <div className="mt-2 flex gap-1">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary opacity-75">
            &nbsp;
          </span>
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary opacity-75 delay-150">
            &nbsp;
          </span>
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary opacity-75 delay-300">
            &nbsp;
          </span>
        </div>
      </div>
    </div>
  );
}
