import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Type alias for the inferred data row structure
type DataRow = z.infer<ReturnType<typeof z.record>>;

// Define the input schema for the visualization tool
const visualizationInputSchema = z.object({
  chartType: z
    .enum(["bar", "line", "pie", "flowchart", "gantt"])
    .describe("Type of chart to create"),
  title: z.string().describe("Title of the chart"),
  xAxis: z.string().describe("Label for the x-axis"),
  yAxis: z.string().describe("Label for the y-axis"),
  data: z
    .string()
    .describe(
      "JSON string representing an array of data objects to visualize. Values in objects can be string, number, boolean, or null.",
    ),
  xField: z.string().describe("Field name (key) to use for the x-axis"),
  yField: z.string().describe("Field name (key) to use for the y-axis"),
});

const visualizationOutputSchema = z.object({
  step: z.string().describe("The step in the process"),
  results: z.string().describe("The results of the visualization"),
});

// Function to generate Mermaid syntax based on the chart type
const generateMermaidSyntax = (
  chartType: string,
  title: string,
  xAxis: string,
  yAxis: string,
  jsonData: string,
  xField: string,
  yField: string,
): string => {
  let data: DataRow[];

  try {
    const parsedJson = JSON.parse(jsonData);
    if (!Array.isArray(parsedJson)) {
      throw new Error("Parsed JSON data is not an array");
    }
    data = parsedJson as DataRow[];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown JSON parsing error";
    throw new Error(`Failed to parse input JSON data: ${message}`);
  }

  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    if (!headers.includes(xField) || !headers.includes(yField)) {
      throw new Error(
        `Required fields '${xField}' or '${yField}' not found in data object keys. Available keys: ${headers.join(", ")}`,
      );
    }
  }

  const parseNumericValue = (
    value: string | number | boolean | null | undefined,
  ): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string")
      return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    if (typeof value === "boolean") return value ? 1 : 0;
    return 0;
  };

  const formatLabel = (
    value: string | number | boolean | null | undefined,
  ): string => {
    return value === null || value === undefined ? "" : String(value);
  };

  const countByField = (field: string): Record<string, number> => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const value = formatLabel(item[field]);
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  };

  switch (chartType) {
    case "bar":
      return `
        xychart-beta
            title "${title}"
            x-axis ${xAxis}
            y-axis "${yAxis}" 0 --> 10000
            bar [${data.map((item) => parseNumericValue(item[yField])).join(", ")}]
      `;
    case "line":
      return `
        xychart-beta
            title "${title}"
            x-axis ${xAxis}
            y-axis "${yAxis}" 0 --> 10000
            line [${data.map((item) => parseNumericValue(item[yField])).join(", ")}]
      `;
    case "pie":
      if (data.length === 0) {
        throw new Error("No data available for pie chart");
      }
      const firstYValue = data[0][yField];
      if (typeof firstYValue !== "number") {
        const counts = countByField(xField);
        return `
          pie
              title "${title}"
              ${Object.entries(counts)
                .map(([key, value]) => `"${key}" : ${value}`)
                .join("\n")}
        `;
      } else {
        return `
          pie
              title "${title}"
              ${data
                .map(
                  (item) =>
                    `"${formatLabel(item[xField])}" : ${parseNumericValue(item[yField])}`,
                )
                .join("\n")}
        `;
      }
    case "flowchart":
      return `
        flowchart TD
            ${data
              .map(
                (item) =>
                  `${formatLabel(item[xField])} --> ${formatLabel(item[yField])}`,
              )
              .join("\n")}
      `;
    case "gantt":
      return `
        gantt
            title "${title}"
            dateFormat YYYY-MM-DD
            ${data
              .map((item) => {
                const taskName = formatLabel(item[xField]);
                const startDate = formatLabel(
                  item.start || item.startDate || "2023-01-01",
                );
                const duration = formatLabel(
                  item.duration || item.length || "10",
                );
                const durationNum = duration.match(/\d+/)?.[0] || "10";
                return `${taskName} : ${startDate}, ${durationNum}d`;
              })
              .join("\n")}
      `;
    default:
      throw new Error(`Unsupported chart type: ${chartType}`);
  }
};

// Create the visualization tool
export const createVisualization = createTool({
  id: "Create Visualization",
  inputSchema: visualizationInputSchema,
  outputSchema: visualizationOutputSchema,
  description: `Generates a Mermaid diagram based on the provided data (as a JSON string representing an array of objects) and chart type. Values in objects can be string, number, boolean, or null. Supported chart types: bar, line, pie, flowchart, gantt.`,
  execute: async ({
    context: { chartType, title, xAxis, yAxis, data, xField, yField },
  }) => {
    try {
      const mermaidSyntax = generateMermaidSyntax(
        chartType,
        title,
        xAxis,
        yAxis,
        data,
        xField,
        yField,
      );
      return {
        results: mermaidSyntax,
        step: "visualization",
      };
    } catch (error) {
      console.error("Error generating visualization:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        results: `Error generating visualization: ${errorMessage}`,
        step: "error",
      };
    }
  },
});
