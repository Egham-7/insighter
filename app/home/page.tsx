"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCreateChat } from "@/hooks/chat/useCreateChat";
import { useUser } from "@clerk/nextjs";
import { useDatabase } from "@/hooks/use-db";

export default function HomePage() {
  const router = useRouter();
  const { loading: dbLoading, error: dbError } = useDatabase();
  const { mutateAsync: createChat } = useCreateChat();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    async function createNewChat() {
      if (!isLoaded || !isSignedIn || dbLoading || dbError) {
        return;
      }

      try {
        const chat = await createChat({
          title: "New Chat",
          user_id: user.id,
          created_at: Date.now(),
        });
        const chatId = chat.id;

        router.push(`/home/chat/${chatId}`);
      } catch (error) {
        console.error("Failed to create new chat:", error);
      }
    }

    createNewChat();
  }, [router, createChat, isLoaded, isSignedIn, user?.id, dbLoading, dbError]);
}
