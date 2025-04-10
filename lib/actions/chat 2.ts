"use client";

import { ChatMessage, FileAttachment, FileType } from "../types/chat";
import { invoke } from "@tauri-apps/api/core";
import db from "../db";

export async function parseCsvFile(filePath: string): Promise<string> {
  try {
    // Call Tauri backend to parse the CSV file
    const parsedData = await invoke<string>("parse_csv", {
      filePath,
    });

    return parsedData;
  } catch (error) {
    console.error("Failed to parse CSV file:", error);
    throw new Error(`Failed to parse CSV file: ${error}`);
  }
}

export async function addAttachmentToChatMessage(
  messageId: number,
  filePath: string,
): Promise<ChatMessage> {
  try {
    // Parse the CSV file
    const csvData = await parseCsvFile(filePath);

    // Extract filename from path
    const fileName = filePath.split(/[/\\]/).pop() || "unknown.csv";

    // Create the attachment
    const newAttachment: FileAttachment = {
      file_name: fileName,
      file_type: FileType.CSV,
      data: csvData,
    };

    // Insert the new attachment into the database
    await db.execute(
      "INSERT INTO file_attachments (chat_message_id, file_name, file_type, data) VALUES (?, ?, ?, ?)",
      [
        messageId,
        newAttachment.file_name,
        newAttachment.file_type,
        JSON.stringify(newAttachment.data),
      ],
    );

    // Get the updated message
    return await getChatMessage(messageId);
  } catch (error) {
    console.error("Failed to add attachment:", error);
    throw new Error(`Failed to add attachment: ${error}`);
  }
}

export async function removeAttachmentFromChatMessage(
  messageId: number,
  fileName: string,
): Promise<ChatMessage> {
  // Delete the attachment from the database
  await db.execute(
    "DELETE FROM file_attachments WHERE chat_message_id = ? AND file_name = ?",
    [messageId, fileName],
  );

  // Get the updated message
  return await getChatMessage(messageId);
}

export async function clearAllChatMessages(): Promise<boolean> {
  try {
    // Delete all messages from the database
    // Note: File attachments will be deleted automatically due to ON DELETE CASCADE
    await db.execute("DELETE FROM chat_messages");
    return true;
  } catch (error) {
    console.error("Failed to clear chat messages:", error);
    return false;
  }
}
