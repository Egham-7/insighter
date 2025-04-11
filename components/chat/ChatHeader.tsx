"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Trash2, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";
import useClearAllChatMessages from "@/hooks/chat/useClearAllChatMessages";

export function ChatHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const clearAllMessages = useClearAllChatMessages();

  const handleClearMessages = () => {
    clearAllMessages.mutate();
    setClearDialogOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
        </div>

        <div className="flex flex-col">
          <h2 className="text-sm font-medium">AI Assistant</h2>
          <p className="text-xs text-muted-foreground">Ready to help</p>
        </div>
      </div>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onSelect={() => setClearDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Chat History</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Chat Confirmation Dialog */}
        <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Clear Chat History
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all chat messages. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearMessages}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={clearAllMessages.isPending}
              >
                {clearAllMessages.isPending
                  ? "Clearing..."
                  : "Clear All Messages"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
