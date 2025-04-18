import { ChatForm } from "@/components/chat/ChatForm";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ChatForm chatId={Number(id)} />;
}
