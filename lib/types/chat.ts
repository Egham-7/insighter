"use server";

import { invoke } from "@tauri-apps/api/tauri";

export interface CsvRecord {
  values: string[];
}

export interface JsonRecord {
  [key: string]: unknown;
}

export interface TextRecord {
  content: string;
}

export type SupportedRecordTypes = CsvRecord | JsonRecord | TextRecord;

export interface ChatMessage<T = SupportedRecordTypes> {
  role: string;
  content: string;
  attachments: T[];
  timestamp: number;
}

export async function createChatMessage<T = SupportedRecordTypes>(
  role: string,
  content: string,
  filePaths: (string | null)[] = [],
  timestamp = Date.now(),
): Promise<ChatMessage<T>> {
  const message = await invoke<ChatMessage<T>>("create_chat_message", {
    role,
    content,
    file_paths: filePaths,
    timestamp,
  });

  return message;
}
