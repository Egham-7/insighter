import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FileWithPath } from "./ChatInput";

interface FileAttachmentsProps {
  files: FileWithPath[];
  onRemoveFile: (index: number) => void;
}

export function FileAttachments({ files, onRemoveFile }: FileAttachmentsProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {files.map((file, i) => (
        <div key={i} className="relative rounded-lg border bg-muted/30 p-2">
          <div className="relative h-16 w-16 overflow-hidden rounded-lg">
            <Image
              src="/images/csv.png"
              alt={file.name}
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            onClick={() => onRemoveFile(i)}
            size="icon"
            variant="secondary"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
          >
            <X size={12} />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
