"use client";

import { useTenantData } from "@/hooks/useTenantData/useTenantData";

/**
 * TenantDataProvider - Automatically fetches tenant data after login
 *
 * This component should be placed once in the root layout.
 * It triggers the API call after authentication and stores data globally.
 * All other components can use useTenantStore() to access the data.
 */
export function TenantDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will automatically fetch tenant data once after login
  useTenantData();

  return <>{children}</>;
}
