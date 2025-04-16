import { useQuery } from "@tanstack/react-query";
import { useDatabase } from "../use-db";
import { Chat } from "@/lib/types/chat";

// Hook for getting all chats for a user
export const useGetChats = (userId: string) => {
  const { db, loading, error } = useDatabase();

  return useQuery({
    queryKey: ["chats", userId],
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

      // Get chats for a specific user
      const chats = (await db.select(
        "SELECT id, title, user_id, created_at FROM chats WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
      )) as Chat[];
      return chats;
    },
    enabled: !!db && !loading,
  });
};
