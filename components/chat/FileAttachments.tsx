import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FileWithPath } from "./ChatInput";
import { FaFileCsv, FaFilePdf, FaFile } from "react-icons/fa";

interface FileAttachmentsProps {
  files: FileWithPath[];
  onRemoveFile: (index: number) => void;
}

export function FileAttachments({ files, onRemoveFile }: FileAttachmentsProps) {
  if (!files || files.length === 0) return null;

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "csv":
        return <FaFileCsv className="h-8 w-8 text-green-600" />;
      case "pdf":
        return <FaFilePdf className="h-8 w-8 text-red-600" />;
      default:
        return <FaFile className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {files.map((file, i) => (
        <div key={i} className="relative rounded-lg border bg-muted/30 p-2">
          <div className="relative h-16 w-16 overflow-hidden rounded-lg flex items-center justify-center">
            {getFileIcon(file.name)}
            <span className="text-xs mt-2 block truncate max-w-full text-center">
              {file.name.length > 10
                ? `${file.name.substring(0, 10)}...`
                : file.name}
            </span>
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
