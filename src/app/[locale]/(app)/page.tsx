"use client";

import {
  SaveCancelAlertExample,
  SaveCancelDialogExample,
  SaveCancelToolbarExample,
} from "@/components/examples/save-cancel-examples";
import { DashboardToolbarDemo } from "@/components/examples/dashboard-toolbar-demo";
import { CenteredLayout } from "@/components/layout/PageContent";
import CartPriceDetails from "@/components/custom/CartPriceDetails";
import { QuoteFilterDrawer, QuoteFilterFormData } from "@/components/sales";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleQuoteFilterSubmit = (_data: QuoteFilterFormData) => {
    // Handle filter submission logic here
    // console.log("Quote Filter Data:", _data);
  };

  const handleQuoteFilterReset = () => {
    // console.log("Quote filters reset");
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  return (
    <CenteredLayout className="min-h-screen bg-background">
      <div className="space-y-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Components Demo</h1>
            <p className="text-muted-foreground">
              Test the migrated components, dashboard toolbar, and Quote Filter
              Form
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
            {/* Left side content - spans 2 columns on large screens */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quote Filter Drawer Component Test */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Quote Filter Drawer Test
                </h2>
                <Button onClick={handleOpenDrawer} variant="outline">
                  Open Filter Drawer
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

              <div className="bg-card border rounded-lg p-6">
                <DashboardToolbarDemo />
              </div>

              <div className="bg-card border rounded-lg p-6">
                <SaveCancelToolbarExample />
              </div>

              <div className="bg-card border rounded-lg p-6">
                <SaveCancelDialogExample />
              </div>

              <div className="bg-card border rounded-lg p-6">
                <SaveCancelAlertExample />
              </div>
            </div>

            {/* Right side - CartPriceDetails */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <CartPriceDetails />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CenteredLayout>
  );
}
