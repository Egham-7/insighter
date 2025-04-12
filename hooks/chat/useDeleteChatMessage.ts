import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useDatabase } from "../use-db";
import { toast } from "sonner";
import { ChatMessage } from "@/lib/types/chat";

const useDeleteChatMessage = () => {
  const queryClient = useQueryClient();
  const { db, loading, error } = useDatabase();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      if (loading) {
        throw new Error("Database is loading");
      }
      if (error) {
        throw new Error("Error loading database");
      }
      if (!db) {
        throw new Error("Database not initialized");
      }

      try {
        // First, get the chat_id and timestamp of the message to be deleted
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
          "SELECT id FROM chat_messages WHERE chat_id = ? AND timestamp >= ?",
          [chatId, messageTimestamp],
        )) as { id: number }[];

        // Delete attachments for all messages that will be deleted
        for (const message of messagesToDelete) {
          await db.execute(
            "DELETE FROM file_attachments WHERE chat_message_id = ?",
            [message.id],
          );
        }

        // Delete the message and all messages created after it in the same chat
        await db.execute(
          "DELETE FROM chat_messages WHERE chat_id = ? AND timestamp >= ?",
          [chatId, messageTimestamp],
        );

        return { id, chatId };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["messages", data.chatId] });
      queryClient.invalidateQueries({ queryKey: ["message", data.id] });
      toast.success("Message and subsequent responses deleted");
    },
    onError: (error, id) => {
      toast.error(`Failed to delete messages: ${error.message}`, {
        action: {
          label: "Retry",
          onClick: () => mutation.mutate(id),
        },
      });
    },
  });

  return mutation;
};

export default useDeleteChatMessage;
