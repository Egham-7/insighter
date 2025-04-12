import { useQuery } from "@tanstack/react-query";
import { ChatMessage } from "@/lib/types/chat";
import { FileAttachment } from "@/lib/types/chat";
import { useDatabase } from "../use-db";

export const useGetChatMessages = (chatId: number) => {
  const { db, loading, error } = useDatabase();

  return useQuery({
    queryKey: ["messages", chatId],
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
        "SELECT id, chat_id, role, content, timestamp FROM chat_messages WHERE chat_id = ? ORDER BY timestamp ASC",
        [chatId],
      )) as ChatMessage[];

      if (messagesResult.length === 0) {
        return [];
      }

      const messageIds = messagesResult.map((msg) => msg.id);

      // Safely handle empty array case
      if (messageIds.length === 0) {
        return [];
      }

      const attachmentsResult = (await db.select(
        `SELECT id, chat_message_id, file_name, file_type, data
         FROM file_attachments
         WHERE chat_message_id IN (${messageIds.join(",")})`,
      )) as (FileAttachment & { chat_message_id: number })[];

      const attachmentsByMessageId = new Map();
      for (const attachment of attachmentsResult) {
        if (!attachmentsByMessageId.has(attachment.chat_message_id)) {
          attachmentsByMessageId.set(attachment.chat_message_id, []);
        }
        attachmentsByMessageId.get(attachment.chat_message_id).push({
          id: attachment.id,
          file_name: attachment.file_name,
          file_type: attachment.file_type,
          data: attachment.data,
        });
      }

      for (const message of messagesResult) {
        message.attachments = attachmentsByMessageId.get(message.id) || [];
      }

      return messagesResult;
    },
    enabled: !!db && !loading && chatId !== undefined,
  });
};
