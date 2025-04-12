import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "@/lib/types/chat";
import { useDatabase } from "../use-db";
import { toast } from "sonner";

export const useCreateChatMessage = () => {
  const queryClient = useQueryClient();
  const { db, loading, error } = useDatabase();

  const mutation = useMutation({
    mutationFn: async (newMessage: Omit<ChatMessage, "id">) => {
      if (loading) {
        throw new Error("Database is loading");
      }
      if (error) {
        throw new Error("Error loading database");
      }
      if (!db) {
        throw new Error("Database not initialized");
      }

      // Insert the new message into the database
      const result = await db.execute(
        "INSERT INTO chat_messages (chat_id, role, content, timestamp) VALUES (?, ?, ?, ?)",
        [
          newMessage.chat_id,
          newMessage.role,
          newMessage.content,
          newMessage.timestamp || Math.floor(Date.now() / 1000), // Using Unix timestamp as INTEGER
        ],
      );

      // Get the ID of the newly inserted message
      const messageId = result.lastInsertId;

      // Handle attachments if they exist
      if (newMessage.attachments && newMessage.attachments.length > 0) {
        for (const attachment of newMessage.attachments) {
          await db.execute(
            "INSERT INTO file_attachments (chat_message_id, file_name, file_type, data) VALUES (?, ?, ?, ?)",
            [
              messageId,
              attachment.file_name,
              attachment.file_type,
              attachment.data,
            ],
          );
        }
      }

      // Return the complete message with the new ID
      return {
        id: messageId,
        ...newMessage,
      } as ChatMessage;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["messages", data.chat_id] });
      queryClient.invalidateQueries({ queryKey: ["message", data.id] });
      toast.success("Message created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create message: ${error.message}`, {
        action: {
          label: "Retry",
          onClick: () =>
            mutation.mutate(mutation.variables as Omit<ChatMessage, "id">),
        },
      });
    },
  });

  return mutation;
};
