"use client";

import {
  ChevronRight,
  type LucideIcon,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateChat } from "@/hooks/chat/useUpdateChat";
import { useDeleteChat } from "@/hooks/chat/useDeleteChat";
import { useCreateChat } from "@/hooks/chat/useCreateChat";
import { useUser } from "@clerk/nextjs";

// Form schema for editing chat title
const editFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

// Edit Chat Dialog Component
function EditChatDialog({
  chatId,
  chatTitle,
  onEdit,
}: {
  chatId: number;
  chatTitle: string;
  onEdit: (id: number, title: string) => Promise<void>;
}) {
  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: chatTitle,
    },
  });

  const onSubmit = async (values: z.infer<typeof editFormSchema>) => {
    await onEdit(chatId, values.title);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <Pencil size={12} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Chat</DialogTitle>
          <DialogDescription>Change the title of your chat</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Chat title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Chat Dialog Component
function DeleteChatDialog({
  chatId,
  chatTitle,
  onDelete,
}: {
  chatId: number;
  chatTitle: string;
  onDelete: (id: number) => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(chatId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-destructive"
        >
          <Trash2 size={12} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Chat</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{chatTitle}&quot;? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      id: number;
      title: string;
      url: string;
    }[];
  }[];
}) {
  const router = useRouter();
  const { user } = useUser();
  const { mutateAsync: updateChat } = useUpdateChat();
  const { mutateAsync: deleteChat } = useDeleteChat();
  const { mutateAsync: createChat } = useCreateChat();

  const handleCreateNewChat = async () => {
    if (!user?.id) {
      toast.error("You must be signed in to create a new chat");
      return;
    }

    try {
      const chat = await createChat({
        title: "New Chat",
        user_id: user.id,
        created_at: Date.now(),
      });

      router.push(`/home/chat/${chat?.id}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error("Failed to create new chat");
    }
  };

  const handleEditChat = async (id: number, title: string) => {
    try {
      await updateChat({
        id,
        updates: { title },
      });
      toast.success("Chat updated successfully");
    } catch (error) {
      console.error("Failed to update chat:", error);
      toast.error("Failed to update chat");
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  const handleDeleteChat = async (id: number) => {
    try {
      await deleteChat(id);

      // Redirect to home if the current chat is deleted
      const currentPath = window.location.pathname;
      if (currentPath.includes(`/chat/${id}`)) {
        router.push("/home");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between px-4 py-1">
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCreateNewChat}
          title="New Chat"
        >
          <Plus size={16} />
        </Button>
      </div>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.id}>
                      <div className="flex items-center w-full">
                        <SidebarMenuSubButton asChild className="flex-1">
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                        <div className="flex items-center space-x-1 mr-2 opacity-0 absolute right-0 top-0 group-hover:opacity-100 transition-opacity duration-200">
                          <EditChatDialog
                            chatId={subItem.id}
                            chatTitle={subItem.title}
                            onEdit={handleEditChat}
                          />
                          <DeleteChatDialog
                            chatId={subItem.id}
                            chatTitle={subItem.title}
                            onDelete={handleDeleteChat}
                          />
                        </div>
                      </div>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
