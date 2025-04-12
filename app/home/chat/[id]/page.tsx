import { ChatForm } from "@/components/chat/ChatForm";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("Chat ID:", id);

  return <ChatForm chatId={Number(id)} />;
}
