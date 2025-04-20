import { useQueryClient } from "@tanstack/react-query";
import { useDatabase } from "../use-db";
import { useMutation } from "@tanstack/react-query";
import { Chat } from "@/lib/types/chat";
import { toast } from "sonner";

// Hook for deleting a chat
export const useDeleteChat = () => {
  const queryClient = useQueryClient();
  const { db, loading, error } = useDatabase();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      if (loading) {
        return;
      }
      if (error) {
        throw new Error("Error loading database.");
      }
      if (!db) {
        throw new Error("Database not initialized");
      }

      try {
        // Get the chat to retrieve the user_id
        const chats = (await db.select(
          "SELECT user_id FROM chats WHERE id = ?",
          [id],
        )) as Chat[];

        if (!chats || chats.length === 0) {
          throw new Error("Chat not found");
        }

        const userId = chats[0].user_id;

        // Get all message IDs in this chat to handle attachments
        const messagesToDelete = (await db.select(
          "SELECT id FROM chat_messages WHERE chat_id = ?",
          [id],
        )) as { id: number }[];

        // Delete attachments for all messages in this chat
        for (const message of messagesToDelete) {
          await db.execute(
            "DELETE FROM file_attachments WHERE chat_message_id = ?",
            [message.id],
          );
        }

        // Delete all messages in this chat
        await db.execute("DELETE FROM chat_messages WHERE chat_id = ?", [id]);

        // Delete the chat itself
        await db.execute("DELETE FROM chats WHERE id = ?", [id]);

        return { id, userId };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chats", data?.userId] });
      queryClient.invalidateQueries({ queryKey: ["chat", data?.id] });
      queryClient.invalidateQueries({ queryKey: ["messages", data?.id] });
      toast.success("Chat deleted successfully");
    },
    onError: (error, id) => {
      toast.error(`Failed to delete chat: ${error.message}`, {
        action: {
          label: "Retry",
          onClick: () => mutation.mutate(id),
        },
      });
    },
  });

  return mutation;
};
