import { useMutation } from "@tanstack/react-query";
import db from "@/lib/db";
import { useQueryClient } from "@tanstack/react-query";

const useClearAllChatMessages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await db.execute("DELETE FROM chat_messages");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export default useClearAllChatMessages;
