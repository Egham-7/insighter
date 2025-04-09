import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FileAttachmentsProps {
  files: FileList | undefined;
  onRemoveFiles: () => void;
}

export function FileAttachments({
  files,
  onRemoveFiles,
}: FileAttachmentsProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {Array.from(files).map((file, i) => (
        <div key={i} className="relative rounded-lg border bg-muted/30 p-2">
          <div className="relative h-16 w-16 overflow-hidden rounded-lg">
            <Image
              src={URL.createObjectURL(file)}
              alt={file.name}
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            onClick={onRemoveFiles}
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
