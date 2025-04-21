import mermaid from "mermaid";
import { Canvg } from "canvg";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { downloadDir, join } from "@tauri-apps/api/path";
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

export async function preprocessMarkdownWithMermaid(
  markdown: string,
): Promise<string> {
  const mermaidBlockRegex = /```mermaid\s*([\s\S]*?)```/g;
  const matches = Array.from(markdown.matchAll(mermaidBlockRegex));

  if (matches.length === 0) return markdown;

  const replacements = await Promise.all(
    matches.map(async (match, i) => {
      const code = match[1];
      const svgResult = await renderMermaidToSVG(code);
      const pngBuffer = await svgToPngBuffer(svgResult.svg);
      const filename = `mermaid-diagram-${i + 1}.png`;

      // Write PNG to Downloads directory
      await writeFile(filename, pngBuffer, { baseDir: BaseDirectory.Download });

      // Get the absolute path to the file in Downloads
      const downloadsPath = await downloadDir();
      const fullPath = await join(downloadsPath, filename);

      // Use the full path in the Markdown image
      return {
        start: match.index!,
        end: match.index! + match[0].length,
        replacement: `![Mermaid Diagram ${i + 1}](${fullPath})`,
      };
    }),
  );

  let result = "";
  let lastIndex = 0;
  for (const { start, end, replacement } of replacements) {
    result += markdown.slice(lastIndex, start) + replacement;
    lastIndex = end;
  }
  result += markdown.slice(lastIndex);

  return result;
}
