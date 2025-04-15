"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useGetChats } from "@/hooks/chat/useGetChats";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import DatasourceNavGroup from "./DatasourceNavGroup";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Chat } from "@/lib/types/chat";
import { Button } from "../ui/button";

const teamsData = [
  { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
  { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
  { name: "Evil Corp.", logo: Command, plan: "Free" },
];

function ChatNavigationContent({
  isLoading,
  error,
  chats,
  navMainItems,
}: {
  isLoading: boolean;
  error: unknown;
  chats: Chat[];
  navMainItems: React.ComponentProps<typeof NavMain>["items"];
}) {
  if (isLoading) {
    return (
      <div className="px-4 py-2 space-y-4">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <MessageSquare size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium">Chats</span>
        </div>
        <div className="pl-8 space-y-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
        </div>
        <div className="flex items-center justify-center text-xs text-muted-foreground gap-1.5 pt-2">
          <Loader2 size={12} className="animate-spin" />
          <span>Loading chats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 m-2 text-sm bg-destructive/10 text-destructive rounded-md">
        <p className="font-medium">Error loading chats</p>
        <p className="text-xs mt-1 opacity-80">
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
        <button
          className="mt-2 text-xs px-2 py-1 bg-background border rounded-sm hover:bg-muted transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="px-4 py-3 m-2 text-sm bg-muted rounded-md">
        <p className="text-center text-muted-foreground">No chats yet</p>
        <Button
          className="mt-2 w-full text-xs px-2 py-1 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
          onClick={() => (window.location.href = "/home")}
        >
          Start a new chat
        </Button>
      </div>
    );
  }

  return <NavMain items={navMainItems} />;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id || "";

  const {
    data: chats,
    isLoading: isChatsLoading,
    error: chatsError,
  } = useGetChats(userId);

  const navMainItems = React.useMemo(() => {
    if (!chats) return [];
    return [
      {
        title: "Chats",
        url: "/home",
        icon: MessageSquare,
        isActive: true, // Consider if this isActive is still needed or should be dynamic
        items: chats.map((chat) => ({
          id: chat.id,
          title: chat.title,
          url: `/home/chat/${chat.id}`,
        })),
      },
    ];
  }, [chats]);

  const userData = React.useMemo(() => {
    return {
      name: user?.fullName || user?.username || "User",
      email: user?.primaryEmailAddress?.emailAddress || "",
      avatar: user?.imageUrl || "/next.svg", // Consider a better default avatar
    };
  }, [user]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamsData} />
      </SidebarHeader>

      <SidebarContent className="flex flex-col">
        <ChatNavigationContent
          isLoading={isChatsLoading}
          error={chatsError}
          chats={chats || []}
          navMainItems={navMainItems}
        />

        <DatasourceNavGroup />
      </SidebarContent>

      <SidebarFooter>
        {isUserLoaded && <NavUser user={userData} />}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
