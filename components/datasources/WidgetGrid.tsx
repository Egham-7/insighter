"use client";

import { useState, useEffect } from "react";
import type { Widget, DateRange } from "@/lib/types/datasources";
import WidgetComponent from "./WidgetComponent";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface WidgetGridProps {
  widgets: Widget[];
  dateRange: DateRange;
  isCustomizing: boolean;
  onRemoveWidget: (widgetId: string) => void;
  onUpdatePositions: (updatedWidgets: Widget[]) => void;
}

export default function WidgetGrid({
  widgets,
  dateRange,
  isCustomizing,
  onRemoveWidget,
  onUpdatePositions,
}: WidgetGridProps) {
  const [orderedWidgets, setOrderedWidgets] = useState<Widget[]>([]);

  useEffect(() => {
    // Sort widgets by position
    const sorted = [...widgets].sort((a, b) => a.position - b.position);
    setOrderedWidgets(sorted);
  }, [widgets]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(orderedWidgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedWidgets = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    setOrderedWidgets(updatedWidgets);
    onUpdatePositions(updatedWidgets);
  };

  if (orderedWidgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-dashed border-slate-300 p-6">
        <p className="text-slate-500 mb-4">No widgets added yet</p>
        <p className="text-sm text-slate-400">
          Click "Customize" and then "Add Widget" to get started
        </p>
      </div>
    );
  }

  if (isCustomizing) {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {orderedWidgets.map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="h-full"
                    >
                      <WidgetComponent
                        widget={widget}
                        dateRange={dateRange}
                        isCustomizing={isCustomizing}
                        onRemove={() => onRemoveWidget(widget.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orderedWidgets.map((widget) => (
        <div
          key={widget.id}
          className={`${
            widget.size === "large"
              ? "md:col-span-2 lg:col-span-3"
              : widget.size === "medium"
                ? "lg:col-span-2"
                : ""
          }`}
        >
          <WidgetComponent
            widget={widget}
            dateRange={dateRange}
            isCustomizing={isCustomizing}
            onRemove={() => onRemoveWidget(widget.id)}
          />
        </div>
      ))}
    </div>
  );
}
