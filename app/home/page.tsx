import { ChatForm } from "@/components/chat/ChatForm";
import { getAllChatMessages } from "@/lib/actions/chat";

export default async function HomePage() {
  const messages = await getAllChatMessages();
  return <ChatForm messages={messages} />;
}
