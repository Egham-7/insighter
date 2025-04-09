"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { EditMessageForm } from "./EditMessageForm";
import useDeleteChatMessage from "@/hooks/chat/useDeleteChatMessage";

interface ChatMessageProps {
  message: Partial<ChatMessageType>;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);

  const { mutateAsync: deleteChatMessage } = useDeleteChatMessage();

  const handleDelete = async (id: number) => {
    await deleteChatMessage(id);
  };

  if (isEditing && message.role === "user") {
    return (
      <EditMessageForm
        message={message}
        onCancel={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div
      className={cn(
        "mb-4 flex group",
        message.role === "assistant" ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-6 py-4 relative",
          message.role === "assistant"
            ? "bg-gray-100 text-gray-900"
            : "bg-primary text-primary-foreground",
        )}
      >
        <p className="text-sm">{message.content}</p>
        {message.attachments && message.attachments.length > 0 && (
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
        {message.id && message.role === "user" && (
          <div className="absolute -right-20 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} />
              <span className="sr-only">Edit message</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(message.id!)}
            >
              <Trash2 size={16} />
              <span className="sr-only">Delete message</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
