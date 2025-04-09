import { UseMutationResult } from "@tanstack/react-query";

// Define the base interface for all file parsers
export interface FileParser<TOutput> {
  parse: (filePath: string) => Promise<TOutput>;
}

// Define the hook return type
export type UseFileParserResult<TOutput> = UseMutationResult<
  TOutput,
  Error,
  string,
  unknown
>;

// Define a generic type for file parser hooks
export interface UseFileParser<TOutput> {
  (): UseFileParserResult<TOutput>;
}
