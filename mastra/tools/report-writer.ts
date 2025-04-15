// src/tools/reportWriter.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// --- Types ---

const VisualizationSchema = z.object({
  caption: z.string(),
  mermaid: z.string().optional(),
  imageUrl: z.string().optional(),
});

const AnalysisStepSchema = z.object({
  stepTitle: z.string(),
  description: z.string(),
  findings: z.string(),
});

const ReportWriterInputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  analysisSteps: z.array(AnalysisStepSchema),
  visualizations: z.array(VisualizationSchema),
  recommendations: z.array(z.string()),
  references: z.array(z.string()).optional(),
});

const ReportWriterOutputSchema = z.object({
  step: z.string(),
  report: z.string(),
});

type ReportWriterInput = z.infer<typeof ReportWriterInputSchema>;
type Visualization = z.infer<typeof VisualizationSchema>;
type AnalysisStep = z.infer<typeof AnalysisStepSchema>;

// --- Helpers ---

function formatAnalysisSteps(steps: AnalysisStep[]): string {
  return steps
    .map(
      (step, idx) =>
        `### ${idx + 1}. ${step.stepTitle}\n${step.description}\n\n**Findings:** ${step.findings}\n`,
    )
    .join("\n");
}

function formatVisualizations(visualizations: Visualization[]): string {
  return visualizations
    .map((viz, idx) => {
      let content = `**Figure ${idx + 1}: ${viz.caption}**\n\n`;
      if (viz.mermaid) {
        content += "```mermaid\n" + viz.mermaid.trim() + "\n```\n";
      } else if (viz.imageUrl) {
        content += `![${viz.caption}](${viz.imageUrl})\n`;
      }
      return content;
    })
    .join("\n");
}

function formatRecommendations(recommendations: string[]): string {
  return recommendations.map((rec) => `- ${rec}`).join("\n");
}

function formatReferences(references?: string[]): string {
  if (!references || references.length === 0) return "";
  return (
    "## References\n" +
    references.map((ref, idx) => `${idx + 1}. ${ref}`).join("\n") +
    "\n"
  );
}

// --- Main Tool ---

export const reportWriter = createTool({
  id: "Report Writer",
  inputSchema: ReportWriterInputSchema,
  outputSchema: ReportWriterOutputSchema,
  description:
    "Generates a structured Markdown report from analysis results, visualizations, and recommendations.",
  execute: async ({ context }) => {
    try {
      const {
        title,
        summary,
        analysisSteps,
        visualizations,
        recommendations,
        references,
      }: ReportWriterInput = context;

      const reportSections = [
        `# ${title}\n`,
        `## Executive Summary\n${summary}\n`,
        `## Analysis Steps & Findings\n${formatAnalysisSteps(analysisSteps)}`,
        visualizations.length > 0
          ? `## Visualizations\n${formatVisualizations(visualizations)}`
          : "",
        recommendations.length > 0
          ? `## Recommendations\n${formatRecommendations(recommendations)}\n`
          : "",
        formatReferences(references),
      ];

      const report = reportSections.filter(Boolean).join("\n");

      return {
        step: "report-writing",
        report,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        step: "report-writing",
        report: `Error generating report: ${message}`,
      };
    }
  },
});
