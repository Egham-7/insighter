import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import db from "@/lib/db";

const useDeleteChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await db.execute("DELETE FROM chat_messages WHERE id = ?", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export default useDeleteChatMessage;
