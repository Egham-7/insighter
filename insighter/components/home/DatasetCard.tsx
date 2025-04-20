"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface DatasetCardProps {
  dataset: {
    id: string;
    name: string;
    description: string;
    date: string;
    size: string;
  };
  onDelete: (id: string) => void;
  onAnalyse: (id: string) => void;
}

export function DatasetCard({
  dataset,
  onDelete,
  onAnalyse,
}: DatasetCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{dataset.name}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(dataset.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {dataset.description}
      </p>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{dataset.date}</span>
        <span>{dataset.size}</span>
      </div>
      <Button onClick={() => onAnalyse(dataset.id)}>Analyse</Button>
    </Card>
  );
}
