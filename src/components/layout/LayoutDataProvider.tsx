"use client";

import { TenantProvider } from "@/contexts/TenantContext";
import { UserDetailsProvider } from "@/contexts/UserDetailsContext";
import { UserDetails } from "@/lib/interfaces/UserInterfaces";
import { TenantApiResponse } from "@/types/tenant";
import { ReactNode } from "react";

/**
 * LayoutDataProvider - Client-side wrapper for layout data
 * 
 * This component receives server-fetched data and provides it to the app.
 * On subsequent navigations, we can use client-side caching to avoid re-fetching.
 */
interface LayoutDataProviderProps {
  children: ReactNode;
  initialTenantData: TenantApiResponse | null;
  initialUserData: UserDetails | null;
  initialAuthState: boolean;
}

export function LayoutDataProvider({
  children,
  initialTenantData,
  initialUserData,
  initialAuthState,
}: LayoutDataProviderProps) {
  return (
    <TenantProvider initialData={initialTenantData}>
      <UserDetailsProvider
        initialAuthState={initialAuthState}
        initialUserData={initialUserData}
      >
        {children}
      </UserDetailsProvider>
    </TenantProvider>
  );
}

