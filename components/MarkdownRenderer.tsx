import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
