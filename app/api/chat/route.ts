import { NextRequest, NextResponse } from "next/server";
import { mastra } from "@/mastra";

export function errorHandler(error: unknown) {
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
    console.log("Got agent");

    let userContent;

    if (inputData) {
      // Data is available - create analysis prompt
      userContent = prompt
        ? `${prompt}\nData: ${JSON.stringify(inputData)}`
        : `From this dataset: ${JSON.stringify(inputData)}. Analyze the data and provide statistical insights, and make recommendations.`;
    } else {
      userContent = prompt;
    }

    const stream = await agent.stream(userContent, {
      resourceId,
      threadId,
    });

    console.log("Stream created");

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
