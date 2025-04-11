import { useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { useUpdateChatMessage } from "@/hooks/chat/useUpdateChatMessage";

interface EditMessageFormProps {
  message: Partial<ChatMessageType>;
  onCancel: () => void;
  onSave: () => void;
  complete: (
    prompt: string,
    options?:
      | {
          /**
  An optional object of headers to be passed to the API endpoint.
   */
          headers?: Record<string, string> | Headers;
          /**
  An optional object to be passed to the API endpoint.
     */
          body?: object;
        }
      | undefined,
  ) => Promise<string | null | undefined>;
}

export function EditMessageForm({
  message,
  onCancel,
  onSave,
  complete,
}: EditMessageFormProps) {
  const [content, setContent] = useState(message.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: updateChatMessage } = useUpdateChatMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.id) return;

    setIsSubmitting(true);
    try {
      await updateChatMessage({
        id: message.id,
        updates: { ...message, content },
      });
      complete(content, {
        body: { inputData: message.attachments },
      });
      onSave();
    } catch (error) {
      console.error("Failed to update message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4 flex justify-end">
      <div className="max-w-[80%] rounded-2xl px-6 py-4 bg-primary/10 border border-primary">
        <form onSubmit={handleSubmit}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none bg-transparent border-none focus-visible:ring-0 p-0 text-sm"
            placeholder="Edit your message..."
            autoFocus
          />

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              {message.attachments.length} attachment(s) - cannot be edited
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !content.trim()}
            >
              <Check size={16} className="mr-2" />
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
