"use server";
import { dataAnalystAgent4o } from "@/mastra/agents";

export const csvAnalystStreaming = async (
  inputData: unknown[][]
): Promise<void> => {
  try {
    const stream = await dataAnalystAgent4o.stream([
      {
        role: "user",
        content: `From this dataset: ${JSON.stringify(
          inputData
        )}. Analyze the data and provide statistical insights, and make recommendations.`,
      },
    ]);

    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
