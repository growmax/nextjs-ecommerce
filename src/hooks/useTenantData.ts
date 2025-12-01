"use client";

import { useTenant } from "@/contexts/TenantContext";
import { TenantData, useTenantStore } from "@/store/useTenantStore";
import { useEffect } from "react";

/**
 * Hook to access tenant data from the global store
 *
 * This hook syncs tenant data from TenantProvider (server-side fetch)
 * to the Zustand store for backward compatibility with existing code.
 *
 * **No API calls are made** - data comes from server-side fetch in layout.
 */
export function useTenantData() {
  const { tenantData, loading, error, setTenantData } = useTenantStore();
  const tenantContext = useTenant();

  useEffect(() => {
    // Skip if data already loaded in store or if context is loading
    if (tenantData || tenantContext.isLoading) {
      return;
    }

    // Skip if context has error
    if (tenantContext.error) {
      return;
    }

    // Sync data from TenantProvider to Zustand store
    // This ensures backward compatibility with code using useTenantData
    if (
      tenantContext.tenant ||
      tenantContext.company ||
      tenantContext.currency
    ) {
      const syncedData: TenantData = {
        tenant: tenantContext.tenant as any, // Type cast for compatibility
        sellerCompanyId: tenantContext.company as any, // Type cast for compatibility
        sellerCurrency: tenantContext.currency,
      };

      setTenantData(syncedData);
    }
  }, [
    tenantData,
    tenantContext.tenant,
    tenantContext.company,
    tenantContext.currency,
    tenantContext.isLoading,
    tenantContext.error,
    setTenantData,
  ]);

  return {
    tenantData,
    loading,
    error,
  };
}
