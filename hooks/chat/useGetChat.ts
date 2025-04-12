import { useDatabase } from "../use-db";
import { useQuery } from "@tanstack/react-query";
import { Chat } from "@/lib/types/chat";

// Hook for getting a single chat
export const useGetChat = (id: number) => {
  const { db, loading, error } = useDatabase();

  return useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      if (loading) {
        throw new Error("Database is loading");
      }
      if (error) {
        throw new Error("Error loading database");
      }
      if (!db) {
        throw new Error("Database not initialized");
      }

      const chats = (await db.select(
        "SELECT id, title, user_id, created_at FROM chats WHERE id = ?",
        [id],
      )) as Chat[];

      if (!chats || chats.length === 0) {
        throw new Error("Chat not found");
      }

      return chats[0];
    },
    enabled: !!db && !loading && id !== undefined,
  });
};
