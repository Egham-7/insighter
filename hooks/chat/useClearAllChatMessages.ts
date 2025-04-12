import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useDatabase } from "../use-db";
import { toast } from "sonner";

const useClearAllChatMessages = () => {
  const queryClient = useQueryClient();
  const { db, loading, error } = useDatabase();

  const mutation = useMutation({
    mutationFn: async () => {
      if (loading) {
        throw new Error("Database is loading");
      }
      if (error) {
        throw new Error("Error loading database");
      }
      if (!db) {
        throw new Error("Database not initialized");
      }

      // Delete file attachments first due to foreign key constraints
      await db.execute("DELETE FROM file_attachments");

      // Delete all chat messages
      await db.execute("DELETE FROM chat_messages");

      return true;
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["attachments"] });

      toast.success("All chat messages cleared");
    },
    onError: (error) => {
      toast.error(`Error clearing chat messages: ${error.message}`, {
        action: {
          label: "Retry",
          onClick: () => mutation.mutate(),
        },
      });
    },
  });

  return mutation;
};

export default useClearAllChatMessages;
