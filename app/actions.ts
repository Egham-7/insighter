"use server";
import { dataAnalystAgent4o } from "@/mastra/agents";

export const analyzeCsv = async (inputData: unknown[][]) => {
  try {
    const stream = await dataAnalystAgent4o.stream([
      {
        role: "user",
        content: `From this dataset: ${JSON.stringify(
          inputData
        )}. Analyze the data and provide statistical insights, and make recommendations.`,
      },
    ]);

    return stream;
  } catch (error) {
    console.error("Error:", error);
  }
};
