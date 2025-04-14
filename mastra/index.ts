import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { researchNetwork, dataAnalystAgent4o, consultantAgent } from "./agents";

export const mastra = new Mastra({
  networks: { researchNetwork },
  agents: { dataAnalystAgent4o, consultantAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
