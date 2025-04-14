import { Facebook, Search, LineChart, Music } from "lucide-react";
import type { DataSource, Widget } from "@/lib/types/datasources";

export function getDataSourceInfo(sourceId: string): DataSource {
  const dataSources: Record<string, DataSource> = {
    "meta-ads": {
      id: "meta-ads",
      name: "Meta Ads",
      icon: Facebook,
      color: "#1877F2",
      bgColor: "#1877F2",
    },
    "google-ads": {
      id: "google-ads",
      name: "Google Ads",
      icon: Search,
      color: "#EA4335",
      bgColor: "#EA4335",
    },
    "linkedin-ads": {
      id: "linkedin-ads",
      name: "LinkedIn Ads",
      icon: LineChart,
      color: "#0A66C2",
      bgColor: "#0A66C2",
    },
    "tiktok-ads": {
      id: "tiktok-ads",
      name: "TikTok Ads",
      icon: Music,
      color: "#000000",
      bgColor: "#000000",
    },
  };

  return dataSources[sourceId] || dataSources["meta-ads"];
}

export function getInitialWidgets(sourceId: string): Widget[] {
  // Different initial widgets based on data source
  const commonWidgets: Widget[] = [
    {
      id: "total-spend",
      type: "metric",
      title: "Total Ad Spend",
      size: "small",
      position: 0,
      dataSourceId: sourceId,
    },
    {
      id: "impressions",
      type: "metric",
      title: "Impressions",
      size: "small",
      position: 1,
      dataSourceId: sourceId,
    },
    {
      id: "clicks",
      type: "metric",
      title: "Clicks",
      size: "small",
      position: 2,
      dataSourceId: sourceId,
    },
    {
      id: "conversions",
      type: "metric",
      title: "Conversions",
      size: "small",
      position: 3,
      dataSourceId: sourceId,
    },
    {
      id: "performance-trend",
      type: "chart",
      title: "Performance Trend",
      size: "medium",
      position: 4,
      dataSourceId: sourceId,
    },
    {
      id: "top-campaigns",
      type: "campaign",
      title: "Top Campaigns",
      size: "medium",
      position: 5,
      dataSourceId: sourceId,
    },
  ];

  // Add source-specific widgets
  if (sourceId === "meta-ads") {
    return [
      ...commonWidgets,
      {
        id: "audience-breakdown",
        type: "table",
        title: "Audience Breakdown",
        size: "medium",
        position: 6,
        dataSourceId: sourceId,
      },
    ];
  }

  if (sourceId === "google-ads") {
    return [
      ...commonWidgets,
      {
        id: "keyword-performance",
        type: "table",
        title: "Keyword Performance",
        size: "medium",
        position: 6,
        dataSourceId: sourceId,
      },
    ];
  }

  return commonWidgets;
}
