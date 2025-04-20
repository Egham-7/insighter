"use client";
import { useQuery } from "@tanstack/react-query";
import { ChatMessage } from "@/lib/types/chat";
import { FileAttachment } from "@/lib/types/chat";
import { useDatabase } from "../use-db";

// Get single message query
export function useGetMessage(id: number) {
  const { db, loading, error } = useDatabase();

  return useQuery({
    queryKey: ["message", id],
    queryFn: async () => {
      if (loading) {
        return;
      }

      if (error) {
        throw new Error("Error loading database");
      }

      if (!db) {
        throw new Error("Database not initialized");
      }

      const messageResult = (await db.select(
        "SELECT id, chat_id, role, content, timestamp FROM chat_messages WHERE id = ?",
        [id],
      )) as ChatMessage[];

      if (messageResult.length === 0) {
        throw new Error("Message not found");
      }

      const attachmentsResult = (await db.select(
        "SELECT id, file_name, file_type, data FROM file_attachments WHERE chat_message_id = ?",
        [id],
      )) as FileAttachment[];

      const message = messageResult[0];

      // Attach the file attachments to the message
      message.attachments = attachmentsResult.map((att) => ({
        chat_message_id: att.chat_message_id,
        id: att.id,
        file_name: att.file_name,
        file_type: att.file_type,
        data: att.data,
      }));

      return message;
    },
    enabled: !!db && !loading && id !== undefined,
  });
}
