"use client";

import { ChatForm } from "@/components/chat/ChatForm";
import { useGetAllChatMessages } from "@/hooks/chat/useGetChatMessages";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function HomePage() {
  const { data: messages, isLoading, isError } = useGetAllChatMessages();
  console.log(messages);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-md mx-auto mt-8 w-full">
        <Alert variant="destructive">
          <AlertTitle className="text-destructive font-medium">
            Error loading messages
          </AlertTitle>
          <AlertDescription className="mt-2">
            We couldn&apos;t load your chat messages. Please try refreshing the
            page or check your connection.
          </AlertDescription>
        </Alert>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return <ChatForm messages={messages ?? []} />;
}
