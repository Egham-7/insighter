import { Workflow } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";

const myWorkflow = new Workflow({
  name: "my-workflow",
  triggerSchema: z.object({
    inputValue: z.number(),
  }),
});
