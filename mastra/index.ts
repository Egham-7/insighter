import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { researchNetwork } from "./agents";

export const mastra = new Mastra({
  networks: { researchNetwork },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
