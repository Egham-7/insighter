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
  readonly file_name: string;
  readonly file_type: FileType;
  readonly data: JsonValue;
}

// Type to represent any valid JSON value
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ChatMessage {
  readonly role: ChatRole;
  readonly content: string;
  readonly attachments: readonly FileAttachment[];
  readonly timestamp: number;
}

export interface PartialChatMessage {
  readonly role?: ChatRole;
  readonly content?: string;
  readonly file_paths?: readonly (string | null)[];
  readonly timestamp?: number;
}
