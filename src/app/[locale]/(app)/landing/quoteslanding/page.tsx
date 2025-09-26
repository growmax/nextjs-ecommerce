"use client";

import { useState } from "react";
import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import QuoteFilterDrawer from "@/components/sales/QuoteFilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function QuotesLandingPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleExport = () => {
    // Handle export functionality here
    // console.log("Exporting quotes...");
    toast.success("Export has been completed successfully!");
  };

  const handleRefresh = () => {
    // Handle refresh functionality here
    // console.log("Refreshing quotes...");
    toast.success("Data has been refreshed successfully!");
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleQuoteFilterSubmit = (_data: QuoteFilterFormData) => {
    // Handle filter submission logic here
    // console.log("Quote Filter Data:", _data);
    toast.success("Filters have been applied successfully!");
  };

  const handleQuoteFilterReset = () => {
    // console.log("Quote filters reset");
    toast.success("Filters have been reset successfully!");
  };

  return (
    <>
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

      <div>
        <h1>Quotes Landing Page</h1>
        <Button onClick={handleOpenDrawer} variant="outline" className="mb-4">
          <Filter className="h-4 w-4 mr-2" />
          Open Filters
        </Button>
        <QuoteFilterDrawer
          open={isDrawerOpen}
          onClose={handleDrawerClose}
          onSubmit={handleQuoteFilterSubmit}
          onReset={handleQuoteFilterReset}
          statusOptions={[
            { value: "draft", label: "Draft" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "expired", label: "Expired" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
      </div>
      <Toaster richColors />
    </>
  );
}
