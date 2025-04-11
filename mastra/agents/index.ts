import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

export const myAgent = new Agent({
  name: "My Agent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini"),
});

// $2.5 - $10
export const dataAnalystAgent4o = new Agent({
  name: "DataAnalysisAgent",
  instructions:
    "You analyze business data, provide statistical insights, business insights, and make recommendations.",
});

// $1.1 - $4.4
export const dataAnalystAgentO3 = new Agent({
  name: "DataAnalysisAgent",
  instructions: "Analyzes business data and provides statistical insights",
  model: openai("gpt-o3"),
});

// $1.1 • $4.4
export const dataAnalystAgentO1Mini = new Agent({
  name: "DataAnalysisAgent",
  instructions: "Analyzes business data and provides statistical insights",
  model: openai("gpt-o1-mini"),
});

// $15 • $60
export const dataAnalystAgentO1 = new Agent({
  name: "DataAnalysisAgent",
  instructions: "Analyzes business data and provides statistical insights",
  model: openai("gpt-o1"),
});
