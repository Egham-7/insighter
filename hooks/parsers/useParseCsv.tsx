import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { UseFileParser } from "./useFileParser";

// Define the CSV parser hook
const useParseCsv: UseFileParser<string> = () => {
  return useMutation({
    mutationFn: async (filePath: string) => {
      const parsedData = await invoke<string>("parse_csv", {
        filePath,
      });
      return parsedData;
    },
  });
};

export default useParseCsv;
