import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { dataAnalystAgent4o, weatherAgent } from "./agents";
import { myAgent } from "./agents";

import { BusinessData } from "./types/types";

export const mastra = new Mastra({
  agents: { weatherAgent, myAgent, dataAnalystAgent4o },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});

export const csvAnalystStreaming = async (
  inputData: BusinessData[]
): Promise<void> => {
  try {
    const stream = await myAgent.stream([
      {
        role: "user",
        content: `From this data: ${JSON.stringify(
          inputData
        )}. Please analyze the data and provide statistical insights, and make recommendations.`,
      },
    ]);

    console.log("Agent:");
    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
