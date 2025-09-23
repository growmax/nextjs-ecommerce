"use client";

import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { Download } from "lucide-react";

export function DashboardToolbarDemo() {
  const handleExport = () => {
    alert("Export started!");
  };

  const handleRefresh = () => {
    alert("Data refreshed!");
  };

  return (
    <DashboardToolbar
      title="Quotes"
      secondary={{
        condition: true,
        value: "Export",
        handleClick: handleExport,
        startIcon: <Download className="h-4 w-4" />,
      }}
      refresh={{
        condition: true,
        handleRefresh,
      }}
    />
  );
}
