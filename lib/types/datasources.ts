import type { LucideIcon } from "lucide-react";

export interface DataSource {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export type WidgetType = "metric" | "chart" | "table" | "campaign";

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: "small" | "medium" | "large";
  position: number;
  dataSourceId: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}
