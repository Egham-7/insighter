"use client";

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
