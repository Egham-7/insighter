import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Stagehand } from "@browserbasehq/stagehand";
import { startBBSSession } from "@/stagehand/main";

// Define the input schema for the web search tool
const webSearchInputSchema = z.object({
  instructions: z.string().describe("Instructions for what to search for"),
  maxResults: z.number().optional().default(2).describe("Maximum number of results to return"),
  searchEngine: z.enum(["google", "bing", "duckduckgo"]).optional().default("google").describe("Search engine to use"),
});

// Create the web search tool
export const webSearch = createTool({
  id: "Web Search",
  description: "Performs a web search based on the provided instructions and returns the search results",
  inputSchema: webSearchInputSchema,
  execute: async ({ context }) => {
    try {
      // Start a new Browserbase session
      const { sessionId } = await startBBSSession();
      
      // Create a new Stagehand instance
      const stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY,
        projectId: process.env.BROWSERBASE_PROJECT_ID,
        verbose: 1,
        logger: console.log,
        browserbaseSessionID: sessionId,
        disablePino: true,
      });
      
      // Initialize Stagehand
      await stagehand.init();
      
      try {
        const agent = stagehand.agent();
        
        // Create the search instruction based on the context
        const searchInstruction = `Go to ${context.searchEngine} and search for "${context.instructions}" with a focus on business and consulting fields. 
        Extract only the top ${context.maxResults} most relevant business and consulting results, including their titles, URLs, and brief snippets. 
        Prioritize results from business websites, consulting firms, industry reports, and professional services. 
        Return the results in a structured format.`;
        
        // Execute the agent
        const result = await agent.execute({
          instruction: searchInstruction,
          maxSteps: 10,
        });
        
        // Get the debug URL
        const debugUrl = `https://app.browserbase.io/sessions/${sessionId}`;
        
        // Return the result along with session ID and debug URL
        return { 
          results: result.message,
          sessionId,
          debugUrl
        };
      } finally {
        // Close the Stagehand instance
        await stagehand.close();
      }
    } catch (error) {
      console.error("Error performing web search:", error);
      return {
        results: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        sessionId: null,
        debugUrl: null
      };
    }
  }
});

