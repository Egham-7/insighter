"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import DashboardHeader from "@/components/datasources/DashboardHeader";
import WidgetGrid from "@/components/datasources/WidgetGrid";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddWidgetDialog } from "@/components/datasources/AddWidgetDialog";
import type {
  DataSource,
  Widget,
  WidgetType,
  DateRange,
} from "@/lib/types/datasources";
import { getDataSourceInfo, getInitialWidgets } from "@/lib/datasource-utils";

export default function DatasourcePage() {
  const searchParams = useSearchParams();
  const sourceId = searchParams.get("source") || "meta-ads";

  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Load data source info
  useEffect(() => {
    const source = getDataSourceInfo(sourceId);
    setDataSource(source);

    // Get initial widgets for this data source
    const initialWidgets = getInitialWidgets(sourceId);
    setWidgets(initialWidgets);
  }, [sourceId]);

  const handleAddWidget = (widgetType: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: `New ${widgetType} Widget`,
      size: "medium",
      position: widgets.length,
      dataSourceId: sourceId,
    };

    setWidgets([...widgets, newWidget]);
    setIsAddWidgetOpen(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== widgetId));
  };

  const handleUpdateWidgetPositions = (updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);
  };

  const toggleCustomizeMode = () => {
    setIsCustomizing(!isCustomizing);
  };

  if (!dataSource) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          dataSource={dataSource}
          onCustomize={toggleCustomizeMode}
          isCustomizing={isCustomizing}
        />

        <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          <div className="flex items-center gap-2">
            {isCustomizing && (
              <Button
                onClick={() => setIsAddWidgetOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Widget
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <WidgetGrid
            widgets={widgets}
            dateRange={dateRange}
            isCustomizing={isCustomizing}
            onRemoveWidget={handleRemoveWidget}
            onUpdatePositions={handleUpdateWidgetPositions}
          />
        </div>
      </div>

      <AddWidgetDialog
        open={isAddWidgetOpen}
        onOpenChange={setIsAddWidgetOpen}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}
