import { useQueryClient } from "@tanstack/react-query";
import { useDatabase } from "../use-db";
import { Chat } from "@/lib/types/chat";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  const { db, loading, error } = useDatabase();

  const mutation = useMutation({
    mutationFn: async (newChat: Omit<Chat, "id">) => {
      if (loading) {
        throw new Error("Database is loading");
      }
      if (error) {
        throw new Error("Error loading database");
      }
      if (!db) {
        throw new Error("Database not initialized");
      }

      // Insert the new chat into the database
      const result = await db.execute(
        "INSERT INTO chats (title, user_id, created_at) VALUES (?, ?, ?)",
        [
          newChat.title,
          newChat.user_id,
          newChat.created_at || Math.floor(Date.now() / 1000), // Using Unix timestamp as INTEGER
        ],
      );

      // Get the ID of the newly inserted chat
      const chatId = result.lastInsertId;

      // Return the complete chat with the new ID
      return {
        id: chatId,
        ...newChat,
      } as Chat;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chats", data.user_id] });
      queryClient.invalidateQueries({ queryKey: ["chat", data.id] });
      toast.success("Chat created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create chat: ${error.message}`, {
        action: {
          label: "Retry",
          onClick: () =>
            mutation.mutate(mutation.variables as Omit<Chat, "id">),
        },
      });
    },
  });

  return mutation;
};
