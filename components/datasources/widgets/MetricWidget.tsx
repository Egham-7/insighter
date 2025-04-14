"use client";

import { useState, useEffect } from "react";
import type { Widget, DateRange } from "@/lib/types/datasources";
import { ArrowUp, ArrowDown } from "lucide-react";
import { fetchMetricData } from "@/lib/datasource-data";

interface MetricWidgetProps {
  widget: Widget;
  dateRange: DateRange;
}

export default function MetricWidget({ widget, dateRange }: MetricWidgetProps) {
  const [data, setData] = useState<{
    value: number;
    previousValue: number;
    change: number;
    isPositive: boolean;
    label: string;
    format: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const metricData = await fetchMetricData(
        widget.dataSourceId,
        widget.id,
        dateRange,
      );
      setData(metricData);
    };

    loadData();
  }, [widget, dateRange]);

  if (!data) {
    return (
      <div className="h-32 flex items-center justify-center">Loading...</div>
    );
  }

  const formatValue = (value: number) => {
    if (data.format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    } else if (data.format === "percent") {
      return `${value.toFixed(2)}%`;
    } else if (data.format === "number") {
      return new Intl.NumberFormat("en-US").format(value);
    }
    return value;
  };

  return (
    <div className="h-32 flex flex-col justify-center">
      <p className="text-sm text-slate-500 mb-1">{data.label}</p>
      <div className="text-3xl font-bold mb-2">{formatValue(data.value)}</div>
      <div
        className={`flex items-center text-sm ${data.isPositive ? "text-green-600" : "text-red-600"}`}
      >
        {data.isPositive ? (
          <ArrowUp className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDown className="h-4 w-4 mr-1" />
        )}
        <span>{Math.abs(data.change).toFixed(2)}% from previous period</span>
      </div>
    </div>
  );
}
