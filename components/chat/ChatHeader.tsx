"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import AddDatasourceToChatDialog from "./AddDatasourceToChatDialog";
import useClearAllChatMessages from "@/hooks/chat/useClearAllChatMessages";

export interface DataSource {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  chatTitle: string;
  chatId: number;
  lastActive?: Date;
}

export function ChatHeader({
  chatTitle,
  lastActive,
  chatId,
  className,
  ...props
}: ChatHeaderProps) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [addedDataSources, setAddedDataSources] = useState<DataSource[]>([]);
  const { mutateAsync: clearChatMessages } = useClearAllChatMessages();

  const handleAddDatasource = (ds: DataSource) => {
    setAddedDataSources((prev) => [...prev, ds]);
  };

  const handleRemoveDataSource = (id: string) => {
    setAddedDataSources((prev) => prev.filter((ds) => ds.id !== id));
  };

  const handleClearMessages = () => {
    clearChatMessages(chatId);
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
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold md:text-xl">{chatTitle}</h2>
        {lastActive && (
          <p className="text-xs text-muted-foreground">
            Last active: {lastActive.toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Data sources section with tooltips */}
        {addedDataSources.length > 0 && (
          <div className="flex -space-x-2 mr-2">
            <TooltipProvider>
              {addedDataSources.map((source) => (
                <Tooltip key={source.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => handleRemoveDataSource(source.id)}
                    >
                      {source.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{source.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        )}

        {/* Add datasource button */}
        <AddDatasourceToChatDialog
          selectedDatasources={addedDataSources}
          onAdd={handleAddDatasource}
        />

        {/* Settings dropdown */}
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
              >
                Clear All Messages
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
