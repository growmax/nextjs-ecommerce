import CartPriceDetails from "@/components/custom/CartPriceDetails";
import DashboardToolbar from "@/components/custom/DashboardToolbar";
import {
  SaveCancelAlertExample,
  SaveCancelDialogExample,
  SaveCancelToolbarExample,
} from "@/components/examples/save-cancel-examples";

import { CenteredLayout } from "@/components/layout/PageContent";

export default async function Home() {
  return (
    <>
      <DashboardToolbar
        title="Dashboard"
        sticky={false}
        className="w-full"
        refresh={{
          condition: true,
        }}
        primary={{
          condition: true,
          value: "Primary",
        }}
        secondary={{
          condition: true,
          value: "Secondary",
        }}
      />
      <CenteredLayout className="min-h-screen bg-background">
        <div className="space-y-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">SaveCancel Components Demo</h1>
              <p className="text-muted-foreground">
                Test the migrated SaveCancel components
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
              {/* Left side content - spans 2 columns on large screens */}
              <div className="lg:col-span-2 space-y-8">
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
    </>
  );
}
