import { NextRequest, NextResponse } from "next/server";
import { mastra } from "@/mastra";

export async function POST(request: NextRequest) {
  try {
    const { inputData, prompt } = await request.json();
    const agent = mastra.getAgent("dataAnalystAgent4o");

    let userContent;

    if (inputData && Array.isArray(inputData) && inputData.length > 0) {
      // Data is available - create analysis prompt
      userContent = prompt
        ? `${prompt}\nData: ${JSON.stringify(inputData)}`
        : `From this dataset: ${JSON.stringify(inputData)}. Analyze the data and provide statistical insights, and make recommendations.`;
    } else {
      userContent = prompt;
    }

    const stream = await agent.stream([{ role: "user", content: userContent }]);

    return stream.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
