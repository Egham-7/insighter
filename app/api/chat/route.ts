import { NextRequest, NextResponse } from "next/server";
import { mastra } from "@/mastra";

function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export async function POST(request: NextRequest) {
  try {
    const { inputData, prompt, resourceId, threadId } = await request.json();
    const agent = mastra.getAgent("dataAnalystAgent4o");

    console.log("Input Data:", inputData);

    const formattedPrompt = `
    Prompt: 
      ${prompt}

Call the create visualization tool

    Data: 
      ${JSON.stringify(inputData)}
`;

    const stream = await agent.stream(formattedPrompt, {
      resourceId,
      threadId,
      maxSteps: 5, // Allow up to 5 tool usage steps
      onStepFinish: ({ text, toolCalls, toolResults }) => {
        console.log("Step completed:", { text, toolCalls, toolResults });
      },
      onFinish: ({
        steps,
        finishReason, // 'complete', 'length', 'tool', etc.
        usage, // token usage statistics
      }) => {
        console.log("Stream complete:", {
          totalSteps: steps.length,
          finishReason,
          usage,
        });
      },
    });

    return stream.toDataStreamResponse({
      getErrorMessage: errorHandler,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
