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
              JSON.stringify(attachment.data),
            ],
          );
        }
      }

      return updatedMessage;
    },
    onSuccess: (updatedMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["message", updatedMessage.id],
      });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message updated successfully");
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
