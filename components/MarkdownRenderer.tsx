import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@/css/markdown.css";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { writeTextFile, writeFile } from "@tauri-apps/plugin-fs";
import { downloadDir } from "@tauri-apps/api/path";

// Mermaid diagram component with proper rendering
const MermaidDiagram = ({ content }: { content: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const uniqueId = useRef(
    `mermaid-${Math.random().toString(36).substring(2, 11)}`,
  );

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        // Dynamically import mermaid
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;

        // Initialize mermaid with specific settings
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          logLevel: 5, // For debugging
        });

        // Generate a unique ID for this render
        const id = uniqueId.current;

        // Get the diagram definition from content
        const graphDefinition = content;

        // Use mermaid's render method
        const { svg } = await mermaid.render(id, graphDefinition);

        // Only update if component is still mounted
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setIsRendered(true);
        }
      } catch (error) {
        console.error("Failed to render Mermaid diagram:", error);
        console.error("Content that failed:", content);

        if (isMounted) {
          toast.error("Failed to render diagram");
          // Show the error in the container for debugging
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="text-red-500 p-2">
                <p>Failed to render diagram:</p>
                <pre class="text-xs mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded overflow-auto">${
                  error instanceof Error ? error.message : String(error)
                }</pre>
              </div>
            `;
          }
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [content]);

  const exportSVG = async () => {
    if (!containerRef.current) return;

    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) {
      toast.error("No SVG found to export");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const fileName = `diagram-${Date.now()}.svg`;

    try {
      // Get the downloads directory
      const downloadsPath = await downloadDir();
      const filePath = `${downloadsPath}/${fileName}`;

      // Write the SVG data to the file
      await writeTextFile(filePath, svgData);

      toast.success(`Diagram exported as SVG to Downloads folder`);
    } catch (error) {
      console.error("Failed to save SVG:", error);
      toast.error("Could not export diagram as SVG");
    }
  };

  const exportPNG = async () => {
    if (!containerRef.current) return;

    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) {
      toast.error("No SVG found to export");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const fileName = `diagram-${Date.now()}.png`;

    try {
      // Create a canvas to convert SVG to PNG
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create an image from SVG
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);

      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      // Set canvas dimensions and draw the image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // Convert canvas to PNG
      const pngBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!pngBlob) {
        throw new Error("Failed to create PNG");
      }

      // Convert blob to array buffer
      const arrayBuffer = await pngBlob.arrayBuffer();

      // Get the downloads directory
      const downloadsPath = await downloadDir();
      const filePath = `${downloadsPath}/${fileName}`;

      // Write the PNG data to the file
      await writeFile(filePath, new Uint8Array(arrayBuffer));

      toast.success(`Diagram exported as PNG to Downloads folder`);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save PNG:", error);
      toast.error("Could not export diagram as PNG");
    }
  };

  return (
    <div className="relative p-4 my-4 border rounded-md bg-muted/30">
      <div ref={containerRef} className="mermaid-diagram"></div>
      {isRendered && (
        <div className="flex justify-end mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportSVG}>
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPNG}>
                Export as PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown dark:dark">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");

            // Check if this is a mermaid code block
            if (match && match[1] === "mermaid") {
              // Clean up the mermaid content
              const diagramContent = String(children)
                .replace(/^mermaid\s*\n/, "") // Remove "mermaid" line if present
                .trim();

              return <MermaidDiagram content={diagramContent} />;
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
