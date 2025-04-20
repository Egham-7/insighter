import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as ss from "simple-statistics";

type DataRow = Record<string, string | number | boolean | null | undefined>;

const statTestInputSchema = z.object({
  testType: z.enum(["t-test", "anova", "chi-square"]),
  data: z.string(),
  groupField: z.string().optional(),
  valueField: z.string().optional(),
});

const statTestOutputSchema = z.object({
  step: z.string(),
  results: z.string(),
});

function parseData(json: string): DataRow[] {
  const arr = JSON.parse(json);
  if (!Array.isArray(arr)) throw new Error("Data is not an array");
  return arr;
}

function groupBy<T extends DataRow>(
  data: T[],
  groupField: string,
  valueField: string,
): Record<string, number[]> {
  const groups: Record<string, number[]> = {};
  data.forEach((row) => {
    const group = row[groupField];
    const value = row[valueField];
    if (group === undefined || value === undefined) return;
    if (!groups[String(group)]) groups[String(group)] = [];
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (!isNaN(num)) groups[String(group)].push(num);
  });
  return groups;
}

function buildContingencyTable<T extends DataRow>(
  data: T[],
  rowField: string,
  colField: string,
): { table: number[][]; rowCategories: string[]; colCategories: string[] } {
  const rowCategories = Array.from(
    new Set(data.map((row) => String(row[rowField]))),
  );
  const colCategories = Array.from(
    new Set(data.map((row) => String(row[colField]))),
  );
  const table: number[][] = rowCategories.map(() => colCategories.map(() => 0));
  data.forEach((row) => {
    const rowIdx = rowCategories.indexOf(String(row[rowField]));
    const colIdx = colCategories.indexOf(String(row[colField]));
    if (rowIdx !== -1 && colIdx !== -1) {
      table[rowIdx][colIdx]++;
    }
  });
  return { table, rowCategories, colCategories };
}

// One-way ANOVA F-value calculation
function anovaFvalue(samples: number[][]): number {
  const k = samples.length;
  const n = samples.reduce((acc, arr) => acc + arr.length, 0);
  const grandMean = samples.reduce((acc, arr) => acc + ss.sum(arr), 0) / n;

  // Between-group sum of squares
  const ssBetween = samples.reduce((acc, arr) => {
    const mean = ss.mean(arr);
    return acc + arr.length * Math.pow(mean - grandMean, 2);
  }, 0);

  // Within-group sum of squares
  const ssWithin = samples.reduce((acc, arr) => {
    const mean = ss.mean(arr);
    return acc + arr.reduce((a, v) => a + Math.pow(v - mean, 2), 0);
  }, 0);

  const msBetween = ssBetween / (k - 1);
  const msWithin = ssWithin / (n - k);

  return msWithin === 0 ? 0 : msBetween / msWithin;
}

export const runStatisticalTest = createTool({
  id: "Run Statistical Test",
  inputSchema: statTestInputSchema,
  outputSchema: statTestOutputSchema,
  description: `Runs a statistical test (t-test, ANOVA, chi-square) on the provided data and returns a clear, human-readable explanation of the result.`,
  execute: async ({ context: { testType, data, groupField, valueField } }) => {
    try {
      const arr = parseData(data);

      let result: string;

      switch (testType) {
        case "t-test": {
          if (!groupField || !valueField) {
            throw new Error(
              "groupField and valueField are required for t-test",
            );
          }
          const groups = groupBy(arr, groupField, valueField);
          const groupNames = Object.keys(groups);
          if (groupNames.length !== 2) {
            throw new Error(
              `t-test requires exactly two groups. Found: ${groupNames.join(
                ", ",
              )}`,
            );
          }
          const [a, b] = groupNames;
          const t = ss.tTestTwoSample(groups[a], groups[b]);
          result = `T-test between groups "${a}" and "${b}": t = ${t?.toFixed(
            4,
          )}.
Interpretation: If |t| > 2, the difference is likely statistically significant.`;
          break;
        }
        case "anova": {
          if (!groupField || !valueField) {
            throw new Error("groupField and valueField are required for ANOVA");
          }
          const groups = groupBy(arr, groupField, valueField);
          const samples = Object.values(groups);
          if (samples.length < 2) {
            throw new Error("ANOVA requires at least two groups.");
          }
          const f = anovaFvalue(samples);
          result = `ANOVA F-value: ${f.toFixed(4)}.
Interpretation: Higher F suggests group means differ.`;
          break;
        }
        case "chi-square": {
          if (!groupField || !valueField) {
            throw new Error(
              "groupField and valueField are required for chi-square",
            );
          }
          const { table, colCategories } = buildContingencyTable(
            arr,
            groupField,
            valueField,
          );
          // Calculate expected counts
          const rowTotals = table.map((row) => ss.sum(row));
          const colTotals = colCategories.map((_, j) =>
            ss.sum(table.map((row) => row[j])),
          );
          const total = ss.sum(rowTotals);
          const expected: number[][] = table.map((row, i) =>
            row.map((_, j) => (rowTotals[i] * colTotals[j]) / total),
          );
          // Calculate chi-square statistic
          let chi = 0;
          for (let i = 0; i < table.length; i++) {
            for (let j = 0; j < table[i].length; j++) {
              if (expected[i][j] > 0) {
                chi +=
                  Math.pow(table[i][j] - expected[i][j], 2) / expected[i][j];
              }
            }
          }
          result = `Chi-square statistic: ${chi.toFixed(4)}.
Interpretation: Higher value suggests association between variables.`;
          break;
        }
        default:
          throw new Error("Unsupported test type");
      }

      return {
        step: "statistical-test",
        results: result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        step: "error",
        results: `Error running statistical test: ${message}`,
      };
    }
  },
});
