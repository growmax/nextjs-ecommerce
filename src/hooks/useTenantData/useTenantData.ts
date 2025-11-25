"use client";

import { useTenantStore } from "@/store/useTenantStore";
import TenantService from "@/lib/api/services/TenantService";
import { TenantConfigResponse } from "@/types/appconfig";
import { TenantData } from "@/store/useTenantStore";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useEffect } from "react";

/**
 * Hook to fetch and access tenant data from the global store
 *
 * This hook automatically fetches tenant data after user authentication
 * and stores it in Zustand for global access.
 */
export function useTenantData() {
  const { tenantData, loading, error, setTenantData, setLoading, setError } =
    useTenantStore();
  const { isAuthenticated } = useUserDetails();

  useEffect(() => {
    // Only fetch if authenticated and tenant data not already loaded
    if (!isAuthenticated || tenantData || loading) {
      return;
    }

    const fetchTenantData = async () => {
      setLoading(true);

      try {
        // Get domain from environment variable
        const domain =
          process.env.NEXT_PUBLIC_DEFAULT_DOMAIN ||
          "schwingstetter.myapptino.com";

        // Call getTenantConfig from TenantService
        const response: TenantConfigResponse =
          await TenantService.getTenantConfig(domain);

        if (response.data) {
          const { tenant, sellerCompanyId, sellerCurrency } = response.data;

          const tenantInfo: TenantData = {
            tenant: tenant || null,
            sellerCompanyId: sellerCompanyId || null,
            sellerCurrency: sellerCurrency || null,
          };

          setTenantData(tenantInfo);
        } else {
          throw new Error("No tenant data returned from API");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch tenant data";
        setError(errorMessage);
      }
    };

    fetchTenantData();
  }, [
    isAuthenticated,
    tenantData,
    loading,
    setError,
    setLoading,
    setTenantData,
  ]);

  return {
    tenantData,
    loading,
    error,
  };
}
