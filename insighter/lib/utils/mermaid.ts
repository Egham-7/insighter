import mermaid from "mermaid";
import { Canvg } from "canvg";

/** Render Mermaid code to SVG string in the browser. */
export async function renderMermaidToSVG(code: string) {
  const id = "mermaid-svg-" + Math.random().toString(36).substring(2, 9);
  return mermaid.render(id, code);
}

/** Convert SVG string to PNG buffer using a canvas. */
export async function svgToPngBuffer(
  svg: string,
  width = 600,
  height = 300,
): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");
  const v = Canvg.fromString(ctx, svg);
  await v.render();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to convert SVG to PNG"));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(new Uint8Array(reader.result));
          } else {
            reject(new Error("Unknown FileReader result type"));
          }
        };
        reader.readAsArrayBuffer(blob);
      },
      "image/png",
      1,
    );
  });
}

/**
 * Preprocess Markdown in the browser:
 * - Finds all ```mermaid code blocks
 * - Renders each to SVG, then to PNG (as a data URL)
 * - Replaces the code block with a Markdown image using the data URL
 *
 * @param markdown The original Markdown string
 * @returns The processed Markdown string with Mermaid diagrams as images
 */
export async function preprocessMarkdownWithMermaid(
  markdown: string,
): Promise<string> {
  const mermaidBlockRegex = /```mermaid\s*([\s\S]*?)```/g;
  const matches = Array.from(markdown.matchAll(mermaidBlockRegex));

  if (matches.length === 0) return markdown;

  // Prepare replacements in parallel
  const replacements = await Promise.all(
    matches.map(async (match, i) => {
      const code = match[1];
      const svgResult = await renderMermaidToSVG(code);
      const pngBuffer = await svgToPngBuffer(svgResult.svg);
      const dataUrl = await bufferToDataUrl(pngBuffer, "image/png");
      return {
        start: match.index!,
        end: match.index! + match[0].length,
        replacement: `![Mermaid Diagram ${i + 1}](${dataUrl})`,
      };
    }),
  );

  // Build the new markdown string with replacements
  let result = "";
  let lastIndex = 0;
  for (const { start, end, replacement } of replacements) {
    result += markdown.slice(lastIndex, start) + replacement;
    lastIndex = end;
  }
  result += markdown.slice(lastIndex);

  return result;
}

/** Helper: Convert a Uint8Array buffer to a data URL */
async function bufferToDataUrl(
  buffer: Uint8Array,
  mimeType: string,
): Promise<string> {
  const blob = new Blob([buffer], { type: mimeType });
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
