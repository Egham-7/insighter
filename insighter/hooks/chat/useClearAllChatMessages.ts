import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useDatabase } from "../use-db";
import { toast } from "sonner";

const useClearAllChatMessages = () => {
  const queryClient = useQueryClient();
  const { db, loading, error } = useDatabase();

  const mutation = useMutation({
    mutationFn: async (chatId: number) => {
      if (loading) {
        return;
      }
      if (error) {
        throw new Error("Error loading database");
      }
      if (!db) {
        throw new Error("Database not found.");
      }

      // Delete all chat messages for the specific chat ID
      // Due to ON DELETE CASCADE in the schema, this will automatically
      // delete related file_attachments
      await db.execute("DELETE FROM chat_messages WHERE chat_id = ?", [chatId]);

      return true;
    },
    onSuccess: (_, chatId) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      toast.success("Chat messages cleared");
    },
    onError: (error, chatId) => {
      toast.error(`Error clearing chat messages: ${error.message}`, {
        action: {
          label: "Retry",
          onClick: () => mutation.mutate(chatId),
        },
      });
    },
  });

  return mutation;
};

export default useClearAllChatMessages;
