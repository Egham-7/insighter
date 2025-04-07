"use client";
import { useSearchParams } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const data = encodedData ? JSON.parse(decodeURIComponent(encodedData)) : null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Dataset Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Analyzing your dataset insights
            </p>
          </header>

          {/* Data Preview Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Data Preview</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>

          {/* Add your visualization components here */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Chart 1</h3>
              {/* Add your chart component here */}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Chart 2</h3>
              {/* Add your chart component here */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
