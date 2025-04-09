"use client";
import { useQuery } from "@tanstack/react-query";
import { ChatMessage } from "@/lib/types/chat";
import { FileAttachment } from "@/lib/types/chat";
import db from "@/lib/db";

// Get single message query
export function useGetMessage(id: number) {
  return useQuery({
    queryKey: ["message", id],
    queryFn: async () => {
      const messageResult = (await db.select(
        "SELECT id, role, content, timestamp FROM chat_messages WHERE id = ?",
        [id],
      )) as ChatMessage[];

      const attachmentsResult = (await db.select(
        "SELECT file_name, file_type, data FROM file_attachments WHERE chat_message_id = ?",
        [id],
      )) as FileAttachment[];

      const message = messageResult[0];
      message.attachments = attachmentsResult.map((att) => ({
        ...att,
        data: JSON.parse(att.data as string),
      }));

      return message;
    },
  });
}
