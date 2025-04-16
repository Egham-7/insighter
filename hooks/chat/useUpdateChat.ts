import { useQueryClient } from "@tanstack/react-query";
import { useDatabase } from "../use-db";
import { useMutation } from "@tanstack/react-query";
import { Chat } from "@/lib/types/chat";
import { toast } from "sonner";

// Hook for updating an existing chat
export const useUpdateChat = () => {
  const queryClient = useQueryClient();
  const { db, loading, error } = useDatabase();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<Chat>;
    }) => {
      if (loading) {
        throw new Error("Database is loading");
      }
      if (error) {
        throw new Error("Error loading database");
      }
      if (!db) {
        throw new Error("Database not initialized");
      }

      // Get the current chat
      const chats = (await db.select("SELECT * FROM chats WHERE id = ?", [
        id,
      ])) as Chat[];

      if (!chats || chats.length === 0) {
        throw new Error("Chat not found");
      }

      const chat = chats[0];

      // Create updated chat by merging current chat with updates
      const updatedChat = {
        ...chat,
        ...updates,
      };

      // Update the chat in the database
      await db.execute("UPDATE chats SET title = ?, user_id = ? WHERE id = ?", [
        updatedChat.title,
        updatedChat.user_id,
        id,
      ]);

      return updatedChat;
    },
    onSuccess: (updatedChat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({
        queryKey: ["chats", updatedChat.user_id],
      });
      queryClient.invalidateQueries({ queryKey: ["chat", updatedChat.id] });
      toast.success("Chat updated successfully");
    },
    onError: (error, variables) => {
      toast.error(`Failed to update chat: ${error.message}`, {
        action: {
          label: "Retry",
          onClick: () => mutation.mutate(variables),
        },
      });
    },
  });

  return mutation;
};
