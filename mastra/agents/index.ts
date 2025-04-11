import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

// $2.5 - $10
export const dataAnalystAgent4o = new Agent({
  name: "DataAnalysisAgent",
  instructions:
    "You analyze business data, provide statistical insights, business insights, and make recommendations.",
  model: openai("gpt-4o"),
});
