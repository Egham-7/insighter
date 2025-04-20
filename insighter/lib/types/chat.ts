// Literal type for roles to prevent arbitrary strings
export type ChatRole = "user" | "assistant" | "system";

export enum FileType {
  CSV = "csv",
}

// Type guard for FileType
export function isFileType(value: string): value is FileType {
  return Object.values(FileType).includes(value as FileType);
}

export interface FileAttachment {
  readonly id: number;
  readonly file_name: string;
  readonly file_type: FileType;
  readonly data: string;
  readonly chat_message_id: number;
}

export interface ChatMessage {
  readonly id: number;
  readonly role: ChatRole;
  readonly chat_id: number;
  readonly content: string;
  attachments?: readonly FileAttachment[];
  readonly timestamp: number;
}

export interface Chat {
  readonly id: number;
  readonly title: string;
  readonly created_at: number; // Unix timestamp
  readonly user_id: string;
}
