"use client";

import { useState, useEffect } from "react";
import type { Widget, DateRange } from "@/lib/types/datasources";
import { fetchTableData } from "@/lib/datasource-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableData {
  headers: string[];
  rows: Array<Record<string, unknown>>;
}

interface TableWidgetProps {
  widget: Widget;
  dateRange: DateRange;
}

export default function TableWidget({ widget, dateRange }: TableWidgetProps) {
  const [data, setData] = useState<TableData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const tableData = await fetchTableData(widget.id);
      setData(tableData as TableData);
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
      <Table>
        <TableHeader>
          <TableRow>
            {data.headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {data.headers.map((header, cellIndex) => (
                <TableCell key={cellIndex}>{String(row[header])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
