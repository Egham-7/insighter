"use client";

import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AddProjectDialog } from "./AddProjectDialog";
interface AddProjectCardProps {
  onAdd: (title: string, description: string) => void;
}

export function AddProjectCard({ onAdd }: AddProjectCardProps) {
  return (
    <AddProjectDialog onProjectAdd={onAdd}>
      <Card className="w-[350px] h-[200px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors">
        <Plus className="h-10 w-10" />
        <span className="font-bold">Create New Project</span>
      </Card>
    </AddProjectDialog>
  );
}
