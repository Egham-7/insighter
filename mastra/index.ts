import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";

import { weatherAgent } from "./agents";
import { myAgent } from "./agents";

export const mastra = new Mastra({
  agents: { weatherAgent, myAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});

// Generating Text
const response = await myAgent.generate([
  { role: "user", content: "Hello, how can you assist me today?" },
]);

console.log("Agent:", response.text);

// Test Agent
async function testAgent() {
  try {
    const response = await myAgent.generate([
      { role: "user", content: "Test!" },
    ]);
    console.log("Agent:", response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}
//testAgent();

async function testStreaming() {
  try {
    const stream = await myAgent.stream([
      {
        role: "user",
        content:
          "Tell me how to best use agents to analyze business csv data to generate them a report of charts and insigghts that will grow their business.",
      },
    ]);
    console.log("Agent:");
    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testStreaming();
// utils.ts
