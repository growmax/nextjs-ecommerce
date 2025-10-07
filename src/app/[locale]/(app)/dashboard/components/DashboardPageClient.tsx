"use client";

import { useEffect } from "react";
import { DashboardChart } from "./DashboardChart/DashboardChart";
import DashboardOrdersTable from "./DashboardOrdersTable/DashboardOrdersTable";
import PreferenceService from "@/lib/api/services/PreferenceService";
import { AuthStorage } from "@/lib/auth";

export default function DashboardPageClient() {
  useEffect(() => {
    const loadPreferences = async () => {
      // Check if user is authenticated first
      const token = AuthStorage.getAccessToken();
      if (!token) {
        return;
      }

      try {
        // Use server-safe methods to avoid throwing errors
        await PreferenceService.findPreferencesServerSide("order");
        await PreferenceService.findOrderPreferencesServerSide();
        await PreferenceService.findFilterPreferencesServerSide("order");
      } catch (_error) {
        // Handle errors silently
      }
    };

    loadPreferences();
  }, []);
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
