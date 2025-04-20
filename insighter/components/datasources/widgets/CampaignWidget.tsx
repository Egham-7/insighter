"use client";

import { useState, useEffect } from "react";
import type { Widget, DateRange } from "@/lib/types/datasources";
import { fetchCampaignData } from "@/lib/datasource-data";
import { Progress } from "@/components/ui/progress";

interface CampaignWidgetProps {
  widget: Widget;
  dateRange: DateRange;
}

export default function CampaignWidget({
  widget,
  dateRange,
}: CampaignWidgetProps) {
  const [data, setData] = useState<{
    campaigns: {
      name: string;
      spend: number;
      budget: number;
      performance: number;
    }[];
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const campaignData = await fetchCampaignData();
      setData(campaignData);
    };

    loadData();
  }, [widget, dateRange]);

  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="h-64 overflow-auto">
      <div className="space-y-4">
        {data.campaigns.map((campaign, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{campaign.name}</span>
              <span className="text-sm text-slate-500">
                ${campaign.spend.toLocaleString()} / $
                {campaign.budget.toLocaleString()}
              </span>
            </div>
            <Progress
              value={(campaign.spend / campaign.budget) * 100}
              className="h-2"
            />
            <div className="flex justify-between items-center text-xs">
              <span className={`${getPerformanceColor(campaign.performance)}`}>
                {campaign.performance > 0 ? "+" : ""}
                {campaign.performance}% vs. target
              </span>
              <span className="text-slate-500">
                {Math.round((campaign.spend / campaign.budget) * 100)}% of
                budget
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getPerformanceColor(performance: number): string {
  if (performance > 10) return "text-green-600";
  if (performance > 0) return "text-green-500";
  if (performance > -10) return "text-amber-500";
  return "text-red-500";
}
