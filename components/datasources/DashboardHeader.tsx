import { Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DataSource } from "@/lib/types/datasources";

interface DashboardHeaderProps {
  dataSource: DataSource;
  isCustomizing: boolean;
  onCustomize: () => void;
}

export default function DashboardHeader({
  dataSource,
  isCustomizing,
  onCustomize,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${dataSource.bgColor}20` }}
          >
            <dataSource.icon
              className="h-6 w-6"
              style={{ color: dataSource.color }}
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              {dataSource.name} Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              View and analyze your {dataSource.name} performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            variant={isCustomizing ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
            onClick={onCustomize}
          >
            <Settings className="h-4 w-4" />
            {isCustomizing ? "Done" : "Customize"}
          </Button>
        </div>
      </div>
    </header>
  );
}
