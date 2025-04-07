"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AddProjectDialogProps {
  onProjectAdd: (title: string, description: string) => void;
  children: React.ReactNode;
}

export function AddProjectDialog({
  onProjectAdd,
  children,
}: AddProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onProjectAdd(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {/* Use a regular Button with an onClick handler */}
          <Button onClick={handleSubmit}>Create Project</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
