"use client";
import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import { Suspense } from "react";
import ProfilePageClient from "./components/ProfilePageClient";

export default function ProfilePage() {
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background p-6">
          <div className="space-y-4">
            <div className="h-10 w-48 bg-muted animate-pulse rounded" />
            <div className="h-96 w-full bg-muted animate-pulse rounded" />
          </div>
        </div>
      }
    >
      <ProfilePageClient />
    </Suspense>
  );
}
