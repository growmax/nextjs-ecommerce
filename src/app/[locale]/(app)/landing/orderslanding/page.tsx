"use client";

import { useState } from "react";
import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function OrdersLandingPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleExport = () => {
    // Handle export functionality here
    toast.success("Export has been completed successfully!");
  };

  const handleRefresh = () => {
    // Handle refresh functionality here
    toast.success("Data has been refreshed successfully!");
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleOrderFilterSubmit = (_data: QuoteFilterFormData) => {
    // Handle filter submission logic here
    toast.success("Filters have been applied successfully!");
  };

  const handleOrderFilterReset = () => {
    toast.success("Filters have been reset successfully!");
  };

  return (
    <>
      <DashboardToolbar
        title="Orders"
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

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button onClick={handleOpenDrawer} variant="outline" className="mb-4">
            <Filter className="h-4 w-4 mr-2" />
            Open Filters
          </Button>
          <FilterDrawer
            open={isDrawerOpen}
            onClose={handleDrawerClose}
            onSubmit={handleOrderFilterSubmit}
            onReset={handleOrderFilterReset}
            title="Order Filters"
            filterType="Order"
            statusOptions={[
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
              { value: "refunded", label: "Refunded" },
            ]}
          />
        </div>
      </div>
      <Toaster richColors />
    </>
  );
}
