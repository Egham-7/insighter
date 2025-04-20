"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WidgetType } from "@/lib/types/datasources";
import { BarChart, LineChart, Table, TrendingUp } from "lucide-react";

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (type: WidgetType) => void;
}

export function AddWidgetDialog({
  open,
  onOpenChange,
  onAddWidget,
}: AddWidgetDialogProps) {
  const widgetTypes: {
    type: WidgetType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      type: "metric",
      label: "Metric Card",
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Display a single KPI with trend indicator",
    },
    {
      type: "chart",
      label: "Chart",
      icon: <LineChart className="h-6 w-6" />,
      description: "Visualize data trends over time",
    },
    {
      type: "table",
      label: "Data Table",
      icon: <Table className="h-6 w-6" />,
      description: "Show detailed data in tabular format",
    },
    {
      type: "campaign",
      label: "Campaign Performance",
      icon: <BarChart className="h-6 w-6" />,
      description: "Track campaign metrics and budget usage",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Choose a widget type to add to your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {widgetTypes.map((widget) => (
            <Button
              key={widget.type}
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-6 gap-3 hover:bg-slate-50"
              onClick={() => onAddWidget(widget.type)}
            >
              <div className="bg-primary/10 text-primary p-3 rounded-full">
                {widget.icon}
              </div>
              <div className="text-center">
                <h3 className="font-medium">{widget.label}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {widget.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
