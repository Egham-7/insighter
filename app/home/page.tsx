"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCreateChat } from "@/hooks/chat/useCreateChat";
import { useGetChats } from "@/hooks/chat/useGetChats";
import { useUser } from "@clerk/nextjs";
import { useDatabase } from "@/hooks/use-db";

export default function HomePage() {
  const router = useRouter();
  const { loading: dbLoading, error: dbError } = useDatabase();
  const { mutateAsync: createChat } = useCreateChat();
  const { user, isLoaded, isSignedIn } = useUser();

  // Fetch existing chats for the user
  const { data: chats, isLoading: isChatsLoading } = useGetChats(
    user?.id || "",
  );

  useEffect(() => {
    async function handleChatNavigation() {
      if (!isLoaded || !isSignedIn || dbLoading || dbError || isChatsLoading) {
        return;
      }

      try {
        // If there are existing chats, redirect to the most recent one
        if (chats && chats.length > 0) {
          const mostRecentChat = chats[0]; // Assuming chats are ordered by created_at DESC
          router.push(`/home/chat/${mostRecentChat.id}`);
        } else {
          // If no chats exist, create a new one
          const chat = await createChat({
            title: "New Chat",
            user_id: user.id,
            created_at: Date.now(),
          });
          router.push(`/home/chat/${chat.id}`);
        }
      } catch (error) {
        console.error("Failed to handle chat navigation:", error);
      }
    }

    handleChatNavigation();
  }, [
    router,
    createChat,
    isLoaded,
    isSignedIn,
    user?.id,
    dbLoading,
    dbError,
    chats,
    isChatsLoading,
  ]);

  return null; // Or a loading indicator if you prefer
}
