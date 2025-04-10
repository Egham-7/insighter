"use client";

import { ChatForm } from "@/components/chat/ChatForm";
import { useGetAllChatMessages } from "@/hooks/chat/useGetChatMessages";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useState, useRef, useEffect } from "react";
import { Results } from "@/components/chat_results/Results";

export default function HomePage() {
  const { data: messages, isLoading, isError } = useGetAllChatMessages();
  console.log(messages);
  const [rightWidth, setRightWidth] = useState(50); // Initial width percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;

      // Calculate percentage (100 - x because we're setting right width)
      let newRightWidthPercent = 100 - (mouseX / containerWidth) * 100;

      // Apply constraints (25% to 75%)
      newRightWidthPercent = Math.max(25, Math.min(75, newRightWidthPercent));

      setRightWidth(newRightWidthPercent);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleDividerMouseDown = () => {
    isDraggingRef.current = true;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none"; // Prevent text selection during resize
  };

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

  //return( <ChatForm messages={messages ?? []} />;)

  return (
    <div ref={containerRef} className="h-screen w-full flex relative">
      {/* Left half - Chat component */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${100 - rightWidth}%` }}
      >
        <ChatForm messages={messages ?? []} />
      </div>

      {/* Resizable divider */}
      <div
        className="w-1 bg-gray-300 hover:bg-primary cursor-ew-resize h-full absolute"
        style={{ left: `calc(${100 - rightWidth}% - 0.5px)` }}
        onMouseDown={handleDividerMouseDown}
      ></div>

      {/* Right half - Empty div */}
      <div className="h-full bg-gray-50" style={{ width: `${rightWidth}%` }}>
        <Results />
      </div>
    </div>
  );
}
