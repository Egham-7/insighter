import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { ChatMessage } from "@/lib/types/chat";
import { useDatabase } from "../use-db";
import { toast } from "sonner";

export const useUpdateChatMessage = () => {
  const queryClient = useQueryClient();
  const { db, error, loading } = useDatabase();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<ChatMessage>;
    }) => {
      if (loading) {
        throw new Error("Database is loading");
      }
      if (error) {
        throw new Error("Error loading database");
      }
      if (!db) {
        throw new Error("Database not initialized");
      }

      // Get the current message from the cache
      let message = queryClient.getQueryData<ChatMessage>(["message", id]);
      if (!message) {
        const messages = (await db.select(
          "SELECT * FROM chat_messages WHERE id = ?",
          [id],
        )) as ChatMessage[];
        if (!messages || messages.length === 0) {
          throw new Error("Message not found");
        }
        message = messages[0] as ChatMessage;
      }

      // Create updated message by merging current message with updates
      const updatedMessage = {
        ...message,
        ...updates,
      };

      try {
        // First, get the chat_id and timestamp of the message to be updated
        const messageData = (await db.select(
          "SELECT chat_id, timestamp FROM chat_messages WHERE id = ?",
          [id],
        )) as ChatMessage[];

        if (!messageData || messageData.length === 0) {
          throw new Error("Message not found");
        }

        const chatId = messageData[0].chat_id;
        const messageTimestamp = messageData[0].timestamp;

        // Get all message IDs that will be deleted to handle attachments
        const messagesToDelete = (await db.select(
          "SELECT id FROM chat_messages WHERE chat_id = ? AND timestamp > ?",
          [chatId, messageTimestamp],
        )) as { id: number }[];

        // Delete attachments for all messages that will be deleted
        for (const message of messagesToDelete) {
          await db.execute(
            "DELETE FROM file_attachments WHERE chat_message_id = ?",
            [message.id],
          );
        }

        // Delete all messages created after this one in the same chat, but not this one itself
        await db.execute(
          "DELETE FROM chat_messages WHERE chat_id = ? AND timestamp > ?",
          [chatId, messageTimestamp],
        );

        // Update the message in the database
        await db.execute(
          "UPDATE chat_messages SET role = ?, content = ?, timestamp = ? WHERE id = ?",
          [
            updatedMessage.role,
            updatedMessage.content,
            updatedMessage.timestamp,
            updatedMessage.id,
          ],
        );

        // Handle attachments if they exist in the updates
        if (updates.attachments) {
          // Delete existing attachments
          await db.execute(
            "DELETE FROM file_attachments WHERE chat_message_id = ?",
            [updatedMessage.id],
          );

          // Insert new attachments
          for (const attachment of updates.attachments) {
            await db.execute(
              "INSERT INTO file_attachments (chat_message_id, file_name, file_type, data) VALUES (?, ?, ?, ?)",
              [
                updatedMessage.id,
                attachment.file_name,
                attachment.file_type,
                attachment.data,
              ],
            );
          }
        }

        return updatedMessage;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (updatedMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["message", updatedMessage.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages", updatedMessage.chat_id],
      });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message updated");
    },
    onError: (error, variables) => {
      toast.error(`Failed to update message: ${error.message}`, {
        action: {
          label: "Retry",
          onClick: () => mutation.mutate(variables),
        },
      });
    },
  });

  return mutation;
};
