import type { DateRange } from "@/lib/types/datasources";

// Mock data functions that would normally fetch from an API
export async function fetchMetricData(
  _dataSourceId: string,
  widgetId: string,
  _dateRange: DateRange,
) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock data based on widget ID
  switch (widgetId) {
    case "total-spend":
      return {
        value: 12458.92,
        previousValue: 10234.56,
        change: 21.73,
        isPositive: true,
        label: "Total Ad Spend",
        format: "currency",
      };
    case "impressions":
      return {
        value: 1245892,
        previousValue: 1123456,
        change: 10.89,
        isPositive: true,
        label: "Impressions",
        format: "number",
      };
    case "clicks":
      return {
        value: 45892,
        previousValue: 52345,
        change: -12.33,
        isPositive: false,
        label: "Clicks",
        format: "number",
      };
    case "conversions":
      return {
        value: 1892,
        previousValue: 1745,
        change: 8.42,
        isPositive: true,
        label: "Conversions",
        format: "number",
      };
    default:
      return {
        value: 0,
        previousValue: 0,
        change: 0,
        isPositive: false,
        label: "Unknown Metric",
        format: "number",
      };
  }
}

export async function fetchChartData() {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 700));

  // Generate mock data for a time series chart
  const days = 30;
  const data = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));

    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.floor(Math.random() * 1000) + 500,
    });
  }

  return data;
}

export async function fetchTableData(widgetId: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Return different mock data based on widget ID
  if (widgetId === "audience-breakdown") {
    return {
      headers: ["Age Group", "Impressions", "Clicks", "CTR", "Cost"],
      rows: [
        {
          "Age Group": "18-24",
          Impressions: "245,678",
          Clicks: "12,345",
          CTR: "5.02%",
          Cost: "$2,456.78",
        },
        {
          "Age Group": "25-34",
          Impressions: "567,890",
          Clicks: "28,945",
          CTR: "5.10%",
          Cost: "$5,678.90",
        },
        {
          "Age Group": "35-44",
          Impressions: "345,678",
          Clicks: "15,678",
          CTR: "4.54%",
          Cost: "$3,456.78",
        },
        {
          "Age Group": "45-54",
          Impressions: "234,567",
          Clicks: "8,765",
          CTR: "3.74%",
          Cost: "$2,345.67",
        },
        {
          "Age Group": "55-64",
          Impressions: "123,456",
          Clicks: "4,321",
          CTR: "3.50%",
          Cost: "$1,234.56",
        },
        {
          "Age Group": "65+",
          Impressions: "78,901",
          Clicks: "2,345",
          CTR: "2.97%",
          Cost: "$789.01",
        },
      ],
    };
  }

  if (widgetId === "keyword-performance") {
    return {
      headers: [
        "Keyword",
        "Impressions",
        "Clicks",
        "CTR",
        "Cost",
        "Conversions",
      ],
      rows: [
        {
          Keyword: "digital marketing",
          Impressions: "45,678",
          Clicks: "2,345",
          CTR: "5.13%",
          Cost: "$1,456.78",
          Conversions: "123",
        },
        {
          Keyword: "online advertising",
          Impressions: "34,567",
          Clicks: "1,845",
          CTR: "5.34%",
          Cost: "$1,234.56",
          Conversions: "98",
        },
        {
          Keyword: "social media marketing",
          Impressions: "56,789",
          Clicks: "2,678",
          CTR: "4.71%",
          Cost: "$1,567.89",
          Conversions: "145",
        },
        {
          Keyword: "ppc management",
          Impressions: "23,456",
          Clicks: "1,234",
          CTR: "5.26%",
          Cost: "$987.65",
          Conversions: "76",
        },
        {
          Keyword: "seo services",
          Impressions: "67,890",
          Clicks: "3,456",
          CTR: "5.09%",
          Cost: "$1,789.01",
          Conversions: "167",
        },
      ],
    };
  }

  return {
    headers: ["Column 1", "Column 2", "Column 3"],
    rows: [
      { "Column 1": "Data 1", "Column 2": "Data 2", "Column 3": "Data 3" },
      { "Column 1": "Data 4", "Column 2": "Data 5", "Column 3": "Data 6" },
      { "Column 1": "Data 7", "Column 2": "Data 8", "Column 3": "Data 9" },
    ],
  };
}

export async function fetchCampaignData() {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    campaigns: [
      {
        name: "Summer Sale Promotion",
        spend: 4567.89,
        budget: 5000.0,
        performance: 15.4,
      },
      {
        name: "Brand Awareness",
        spend: 3456.78,
        budget: 5000.0,
        performance: 8.2,
      },
      {
        name: "Product Launch",
        spend: 6789.01,
        budget: 7500.0,
        performance: -3.5,
      },
      {
        name: "Retargeting Campaign",
        spend: 2345.67,
        budget: 3000.0,
        performance: 22.7,
      },
      {
        name: "Holiday Special",
        spend: 1234.56,
        budget: 2500.0,
        performance: -12.3,
      },
    ],
  };
}
