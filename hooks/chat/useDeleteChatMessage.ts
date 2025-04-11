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
        // First, get the timestamp of the message to be deleted
        const messageData = (await db.select(
          "SELECT timestamp FROM chat_messages WHERE id = ?",
          [id],
        )) as ChatMessage[];

        if (!messageData || messageData.length === 0) {
          throw new Error("Message not found");
        }

        const messageTimestamp = messageData[0].timestamp;

        // Delete the message and all messages created after it
        await db.execute("DELETE FROM chat_messages WHERE timestamp >= ?", [
          messageTimestamp,
        ]);

        return id;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["message", id] });
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
