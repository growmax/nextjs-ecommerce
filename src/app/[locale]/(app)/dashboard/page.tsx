"use client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { DashboardChart } from "./components/DashboardChart/DashboardChart";
import DashboardOrdersTable from "./components/DashboardOrdersTable/DashboardOrdersTable";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after mounting, show loading (middleware will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex gap-6">
          <div className="w-1/2">
            <Card className="w-full h-full">
              <DashboardChart
                userId={parseInt(user?.id || "1032")}
                companyId={user?.companyId || 8690}
                currencyId={96}
              />
            </Card>
          </div>
          <div className="w-1/2">
            <DashboardOrdersTable />
          </div>
        </div>
      </main>
    </div>
  );
}
