import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { dataAnalystAgent4o } from "./agents";

export const mastra = new Mastra({
  agents: { dataAnalystAgent4o },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
