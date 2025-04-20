import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

// Define supported file types
export type SupportedFileType = "csv" | "pdf";

// Define return types for each file type
export interface ParsedCsvData {
  records: string[][];
  headers?: string[];
}

export interface ParsedPdfData {
  text: string;
  pageCount: number;
  metadata?: Record<string, string>;
}

// Map file types to their respective return types
export type ParsedDataMap = {
  csv: ParsedCsvData;
  pdf: ParsedPdfData;
};

// Generic file parser hook with strict typing
function useParseFile<T extends SupportedFileType>(): UseMutationResult<
  ParsedDataMap[T],
  Error,
  string,
  unknown
> {
  return useMutation({
    mutationFn: async (filePath: string) => {
      // Runtime check for supported file extensions
      const extension = filePath.split(".").pop()?.toLowerCase();
      if (!extension || !["csv", "pdf"].includes(extension)) {
        throw new Error(`Unsupported file type: ${extension}`);
      }

      const parsedData = await invoke<ParsedDataMap[T]>("parse_file", {
        filePath,
      });
      return parsedData;
    },
  });
}

export default useParseFile;
