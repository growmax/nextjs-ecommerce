"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { DashboardChart } from "./components/DashboardChart/Dashboardchartdatas";
import DashboardOrdersTable from "./components/DashboardOrdersTable/DashboardOrdersTable";

function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch with faster mounting
  useEffect(() => {
    // Use requestAnimationFrame for smoother mounting
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Simplified loading with side-by-side layout
  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Chart loading skeleton */}
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {!mounted ? "Loading..." : "Authenticating..."}
                </p>
              </div>
            </div>
            {/* Table loading skeleton */}
            <div className="h-[400px] bg-gray-50 rounded-lg animate-pulse"></div>
          </div>
        </main>
      </div>
    );
  }

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

export default DashboardPage;
