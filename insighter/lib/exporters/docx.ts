import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  AlignmentType,
} from "docx";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { svgToPngBuffer } from "../utils/mermaid";
import { renderMermaidToSVG } from "../utils/mermaid";

// --- Types ---

type MarkdownNode = {
  type: string;
  value?: string;
  depth?: number;
  lang?: string;
  children?: MarkdownNode[];
};

/** Map Markdown heading depth to docx HeadingLevel. */
function getHeadingLevel(depth?: number) {
  switch (depth) {
    case 1:
      return HeadingLevel.HEADING_1;
    case 2:
      return HeadingLevel.HEADING_2;
    case 3:
      return HeadingLevel.HEADING_3;
    case 4:
      return HeadingLevel.HEADING_4;
    case 5:
      return HeadingLevel.HEADING_5;
    case 6:
      return HeadingLevel.HEADING_6;
    default:
      return HeadingLevel.HEADING_1;
  }
}

/** Recursively process Markdown AST nodes into docx Paragraphs. */
async function processNode(node: MarkdownNode): Promise<Paragraph[]> {
  // Standard spacing for all blocks (in twips: 200 = 10pt)
  const blockSpacing = { before: 200, after: 200 };

  switch (node.type) {
    case "heading":
      return [
        new Paragraph({
          children: await processInlineNodes(node.children ?? []),
          heading: getHeadingLevel(node.depth),
          alignment: AlignmentType.LEFT,
          spacing: { before: 300, after: 200 }, // More space above headings
        }),
      ];
    case "paragraph":
      return [
        new Paragraph({
          children: await processInlineNodes(node.children ?? []),
          alignment: AlignmentType.LEFT,
          spacing: blockSpacing,
        }),
      ];
    case "code":
      if (node.lang === "mermaid") {
        const svgResult = await renderMermaidToSVG(node.value ?? "");
        const pngBuffer = await svgToPngBuffer(svgResult.svg);
        return [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: blockSpacing,
            children: [
              new ImageRun({
                type: "png",
                data: pngBuffer,
                transformation: { width: 600, height: 300 },
              }),
            ],
          }),
        ];
      } else {
        return [
          new Paragraph({
            children: [
              new TextRun({
                text: node.value ?? "",
                font: "Consolas",
                color: "333333",
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: blockSpacing,
          }),
        ];
      }
    case "list":
      return await Promise.all(
        (node.children ?? []).map(async (item) => {
          const text =
            item.children && item.children[0]
              ? await processInlineNodes(item.children[0].children ?? [])
              : [];
          return new Paragraph({
            children: [new TextRun({ text: "- " }), ...text],
            alignment: AlignmentType.LEFT,
            spacing: blockSpacing,
          });
        }),
      );
    default:
      if (node.children) {
        return await processNodes(node.children);
      }
      return [];
  }
}

/** Process inline nodes (text, strong, emphasis, inlineCode). */
async function processInlineNode(node: MarkdownNode): Promise<TextRun[]> {
  switch (node.type) {
    case "text":
      return [new TextRun({ text: node.value ?? "" })];
    case "strong":
      return [
        new TextRun({
          text: (node.children ?? []).map((c) => c.value ?? "").join(""),
          bold: true,
        }),
      ];
    case "emphasis":
      return [
        new TextRun({
          text: (node.children ?? []).map((c) => c.value ?? "").join(""),
          italics: true,
        }),
      ];
    case "inlineCode":
      return [
        new TextRun({
          text: node.value ?? "",
          font: "Consolas",
          color: "333333",
        }),
      ];
    default:
      if (node.children) return await processInlineNodes(node.children);
      return [];
  }
}

async function processInlineNodes(nodes: MarkdownNode[]): Promise<TextRun[]> {
  const results = await Promise.all(nodes.map(processInlineNode));
  return results.flat();
}

async function processNodes(nodes: MarkdownNode[]): Promise<Paragraph[]> {
  const results = await Promise.all(nodes.map(processNode));
  return results.flat();
}

// --- Main Exported Function ---

/**
 * Converts Markdown (with Mermaid diagrams) to a DOCX buffer.
 * @param markdown The Markdown string to convert.
 * @returns Uint8Array buffer of the DOCX file.
 */
export async function markdownToDocx(markdown: string): Promise<Uint8Array> {
  const tree = unified().use(remarkParse).parse(markdown) as MarkdownNode;
  const docxElements = await processNodes(tree.children ?? []);
  const doc = new Document({
    sections: [{ children: docxElements }],
  });
  return await Packer.toBuffer(doc);
}
