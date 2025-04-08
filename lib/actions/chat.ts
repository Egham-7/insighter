"use server";

import { ChatMessage } from "../types/chat";
import { invoke } from "@tauri-apps/api/core";

export async function createChatMessage(
  role: string,
  content: string,
  timestamp: number,
  filePaths?: string[],
): Promise<ChatMessage> {
  return await invoke("create_chat_message", {
    role,
    content,
    filePaths,
    timestamp,
  });
}

export async function updateChatMessage(
  message: ChatMessage,
  updates: Partial<ChatMessage>,
): Promise<ChatMessage> {
  return await invoke("update_chat_message", {
    message,
    updates,
  });
}
