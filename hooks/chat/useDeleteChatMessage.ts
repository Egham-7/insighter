import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useDatabase } from "../use-db";
const useDeleteChatMessage = () => {
  const queryClient = useQueryClient();
  const { db, loading, error } = useDatabase();
  return useMutation({
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export default useDeleteChatMessage;
