"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { useEffect, useState } from "react";
import { FloatingActionButton } from "@/components/home/FloatingActionButton";
import { DatasetCard } from "@/components/home/DatasetCard";
import * as Papa from "papaparse";
import { useRouter } from "next/navigation";

interface Dataset {
  id: string;
  name: string;
  description: string;
  date: string;
  size: string;
  data?: unknown[];
}

const SAMPLE_DATASETS: Dataset[] = [
  {
    id: "1",
    name: "Sales Data 2023",
    description: "Annual sales performance analysis",
    date: "2024-01-15",
    size: "2.5 MB",
    data: [
      { month: "January", revenue: 50000, units: 500 },
      { month: "February", revenue: 55000, units: 550 },
      { month: "March", revenue: 60000, units: 600 },
    ],
  },
  {
    id: "2",
    name: "Customer Feedback",
    description: "Customer satisfaction survey results",
    date: "2024-01-10",
    size: "1.8 MB",
    data: [
      { customer_id: 1, rating: 4.5, feedback: "Great service" },
      { customer_id: 2, rating: 4.0, feedback: "Good experience" },
      { customer_id: 3, rating: 5.0, feedback: "Excellent support" },
    ],
  },
];

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    setDatasets(SAMPLE_DATASETS);
  }, []);

  const handleAnalyse = (id: string) => {
    const dataset = datasets.find((dataset) => dataset.id === id);
    if (dataset) {
      const queryParams = new URLSearchParams({
        data: JSON.stringify(dataset.data),
      }).toString();
      router.push(`/home/analytics/${id}?${queryParams}`);
    }
  };

  const handleAddDataset = (
    title: string,
    description: string,
    file: File | null,
  ) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const newDataset: Dataset = {
          id: crypto.randomUUID(),
          name: title,
          description: description,
          date: new Date().toISOString().split("T")[0],
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          data: results.data,
        };
        setDatasets([...datasets, newDataset]);
      },
    });
  };

  const handleDeleteDataset = (id: string) => {
    setDatasets(datasets.filter((dataset) => dataset.id !== id));
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 relative">
          <header className="space-y-2 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Datasets
            </h2>

            <p className="text-lg text-muted-foreground">
              Upload and analyze your datasets
            </p>
          </header>

          {datasets.length > 0 && (
            <div className="mb-8 p-6 bg-gray-100 rounded-lg shadow-md text-black">
              <h3 className="text-xl font-bold mb-4">Sample Data Preview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Headers:</h4>
                  <pre className="bg-white p-4 rounded">
                    {datasets[0]?.data &&
                      JSON.stringify(
                        Object.keys(datasets[0].data[0]!),
                        null,
                        2,
                      )}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Sample Row:</h4>
                  <pre className="bg-white p-4 rounded">
                    {datasets[0]?.data &&
                      JSON.stringify(datasets[0].data[0], null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                onDelete={handleDeleteDataset}
                onAnalyse={handleAnalyse}
              />
            ))}
            <FloatingActionButton onSubmit={handleAddDataset} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
