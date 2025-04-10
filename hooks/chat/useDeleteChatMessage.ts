import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useDatabase } from "../use-db";
import { toast } from "sonner";

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
      await db.execute("DELETE FROM chat_messages WHERE id = ?", [id]);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["message", id] });
      toast.success("Message deleted successfully");
    },
    onError: (error, id) => {
      toast.error(`Failed to delete message: ${error.message}`, {
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
