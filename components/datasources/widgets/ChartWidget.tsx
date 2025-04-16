"use client";

import { useState, useEffect } from "react";
import type { Widget, DateRange } from "@/lib/types/datasources";
import { fetchChartData } from "@/lib/datasource-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface ChartDataPoint {
  date: string;
  value: number;
}

interface ChartWidgetProps {
  widget: Widget;
  dateRange: DateRange;
}

export default function ChartWidget({ widget, dateRange }: ChartWidgetProps) {
  const [data, setData] = useState<ChartDataPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartConfig = {
    value: {
      label: widget.title,
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setData(null);
      try {
        const chartData = await fetchChartData();
        if (
          Array.isArray(chartData) &&
          chartData.every((item) => "date" in item && "value" in item)
        ) {
          setData(chartData as ChartDataPoint[]);
        } else {
          console.warn("Fetched data format mismatch:", chartData);
          setData([]);
        }
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
        setError("Failed to load chart data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [widget.dataSourceId, widget.id, dateRange]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-destructive">
        {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available for this period.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
