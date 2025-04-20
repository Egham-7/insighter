import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SiGoogleads } from "react-icons/si";

export interface DataSource {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface AddDatasourceToChatDialogProps {
  // Callback to notify the parent header that a datasource has been added.
  onAdd: (ds: DataSource) => void;
  selectedDatasources: DataSource[];
}

export default function AddDatasourceToChatDialog({
  selectedDatasources,
  onAdd,
}: AddDatasourceToChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // For the sake of this example, we have only one datasource.
  const dataSources: DataSource[] = [
    {
      id: "google-ads",
      name: "Google Ads",
      icon: <SiGoogleads className="h-8 w-8" />,
    },
  ];

  const handleSelectSource = (sourceId: string) => {
    // Check if the datasource is already selected
    const isAlreadySelected = selectedDatasources.some(
      (ds) => ds.id === sourceId,
    );
    if (!isAlreadySelected) {
      setSelectedSource(sourceId);
    }
  };

  const handleAddDatasource = async () => {
    if (!selectedSource) return;
    const addedSource = dataSources.find((ds) => ds.id === selectedSource);
    if (addedSource) {
      onAdd(addedSource);
    }
    setOpen(false);
    setSelectedSource(null);
  };

  const handleClose = () => {
    setSelectedSource(null);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedSource(null);
    }
  };

  // Check if there are any datasources available to add
  const hasAvailableDatasources = dataSources.some(
    (source) => !selectedDatasources.some((ds) => ds.id === source.id),
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost">Add Data Source</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Imported Data Source to Chat
          </DialogTitle>
          <DialogDescription>
            Select one of your imported data sources to integrate into your chat
            context.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
          {dataSources.map((source) => {
            const isAlreadySelected = selectedDatasources.some(
              (ds) => ds.id === source.id,
            );

            return (
              <Card
                key={source.id}
                onClick={() =>
                  !isAlreadySelected && handleSelectSource(source.id)
                }
                className={cn(
                  "flex flex-col items-center justify-center transition-all duration-150 ease-in-out border-2",
                  isAlreadySelected
                    ? "border-muted bg-muted/50 opacity-60 cursor-not-allowed"
                    : selectedSource === source.id
                      ? "border-primary ring-2 ring-primary ring-offset-background ring-offset-2 bg-primary/10 cursor-pointer"
                      : "border-transparent hover:border-border hover:bg-accent cursor-pointer",
                )}
              >
                <CardHeader className="justify-center items-center p-4 pb-2">
                  {source.icon}
                </CardHeader>
                <CardContent className="p-4 pt-2 text-center">
                  <span className="font-medium text-foreground">
                    {source.name}
                  </span>
                  {isAlreadySelected && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Already added
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {!hasAvailableDatasources && (
          <div className="text-center text-muted-foreground py-2">
            All available data sources have already been added to this chat.
          </div>
        )}
        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center border-t pt-4 gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddDatasource}
            disabled={!selectedSource}
            className="min-w-[120px]"
          >
            Add to Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
