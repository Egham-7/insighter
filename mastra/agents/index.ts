import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools";

export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn’t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: openai("gpt-4o"),
  tools: { weatherTool },
});

export const myAgent = new Agent({
  name: "My Agent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini"),
});

// $2.5 - $10
export const dataAnalystAgent4o = new Agent({
  name: "DataAnalysisAgent",
  instructions:
    "You analyze business data, provide statistical insights, business insights, and make reccomendations.",
  model: openai("gpt-4o"),
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
