import { useQuery } from "@tanstack/react-query";
import { ChatMessage } from "@/lib/types/chat";
import { FileAttachment } from "@/lib/types/chat";
import { useDatabase } from "../use-db";

export const useGetAllChatMessages = () => {
  const { db, loading, error } = useDatabase();
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      if (loading) {
        throw new Error("Database is loading");
      }

      if (error) {
        throw new Error("Error loading database");
      }

      if (!db) {
        throw new Error("Database not initialized");
      }
      const messagesResult = (await db.select(
        "SELECT id, role, content, timestamp FROM chat_messages ORDER BY timestamp ASC",
      )) as ChatMessage[];

      if (messagesResult.length === 0) {
        return [];
      }

      const messageIds = messagesResult.map((msg) => msg.id);
      const attachmentsResult = (await db.select(
        `SELECT chat_message_id, file_name, file_type, data
         FROM file_attachments
         WHERE chat_message_id IN (${messageIds.join(",")})`,
      )) as FileAttachment[];

      const attachmentsByMessageId = new Map();
      for (const attachment of attachmentsResult) {
        if (!attachmentsByMessageId.has(attachment.chat_message_id)) {
          attachmentsByMessageId.set(attachment.chat_message_id, []);
        }
        attachmentsByMessageId.get(attachment.chat_message_id).push({
          file_name: attachment.file_name,
          file_type: attachment.file_type,
          data: JSON.parse(attachment.data),
        });
      }

      for (const message of messagesResult) {
        message.attachments = attachmentsByMessageId.get(message.id) || [];
      }

      return messagesResult;
    },
  });
};
