"use client";

import { DashboardChart } from "./DashboardChart/DashboardChart";
import DashboardOrdersTable from "./DashboardOrdersTable/DashboardOrdersTable";

export default function DashboardPageClient() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="w-full">
            <DashboardChart />
          </div>
          <div className="w-full">
            <DashboardOrdersTable />
          </div>
        </div>
      </main>
    </div>
  );
}
