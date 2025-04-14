"use client";

import type { Widget, DateRange } from "@/lib/types/datasources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  X,
  Maximize2,
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MetricWidget from "./widgets/MetricWidget";
import ChartWidget from "./widgets/ChartWidget";
import TableWidget from "./widgets/TableWidget";
import CampaignWidget from "./widgets/CampaignWidget";

interface WidgetComponentProps {
  widget: Widget;
  dateRange: DateRange;
  isCustomizing: boolean;
  onRemove: () => void;
}

export default function WidgetComponent({
  widget,
  dateRange,
  isCustomizing,
  onRemove,
}: WidgetComponentProps) {
  const renderWidgetContent = () => {
    switch (widget.type) {
      case "metric":
        return <MetricWidget widget={widget} dateRange={dateRange} />;
      case "chart":
        return <ChartWidget widget={widget} dateRange={dateRange} />;
      case "table":
        return <TableWidget widget={widget} dateRange={dateRange} />;
      case "campaign":
        return <CampaignWidget widget={widget} dateRange={dateRange} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const getWidgetIcon = () => {
    switch (widget.type) {
      case "metric":
        return <TrendingUp className="h-4 w-4" />;
      case "chart":
        return <LineChart className="h-4 w-4" />;
      case "table":
        return <BarChart className="h-4 w-4" />;
      case "campaign":
        return <PieChart className="h-4 w-4" />;
      default:
        return <BarChart className="h-4 w-4" />;
    }
  };

  return (
    <Card
      className={`h-full ${isCustomizing ? "border-dashed border-2 border-slate-300" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getWidgetIcon()}
          {widget.title}
        </CardTitle>
        <div className="flex items-center gap-1">
          {isCustomizing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 text-slate-500"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove widget</span>
            </Button>
          )}

          {!isCustomizing && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Expand widget</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Refresh data</DropdownMenuItem>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Widget settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>{renderWidgetContent()}</CardContent>
    </Card>
  );
}
