/**
 * Simple App Configuration Hooks
 */

import {
  getCatalogSettings,
  getCategories,
  getDomainConfiguration,
  getStoreFrontConfig,
  getTenantConfig,
} from "@/lib/appconfig";
import type {
  CatalogSettingsResponse,
  CategoriesResponse,
  DomainConfiguration,
  StoreFrontResponse,
  TenantConfigResponse,
} from "@/types/appconfig";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

// Helper function to get token for requests
async function getTokenForRequest(): Promise<string | null> {
  // Server-side
  if (typeof window === "undefined") {
    const { ServerAuth } = await import("@/lib/auth-server");
    const { cookies } = await import("next/headers");

    // Try authenticated token first
    const authToken = await ServerAuth.getAccessToken();
    if (authToken) return authToken;

    // Fall back to anonymous token from cookie (set by client-side API route)
    const cookieStore = await cookies();
    return cookieStore.get("anonymous_token")?.value || null;
  }

  // Client-side - anonymous token is not accessible (httpOnly cookie)
  // For client-side requests, the cookie will be sent automatically
  return null;
}

// Enhanced hooks with automatic token fetching
export function useTenantConfig(
  domain: string
): UseQueryResult<TenantConfigResponse> {
  return useQuery({
    queryKey: ["tenantConfig", domain],
    queryFn: async () => {
      return getTenantConfig(domain);
    },
    enabled: !!domain,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useCategories(
  token?: string,
  tenantCode?: string
): UseQueryResult<CategoriesResponse> {
  return useQuery({
    queryKey: ["categories", tenantCode],
    queryFn: async () => {
      const finalToken = token || (await getTokenForRequest());
      return getCategories(finalToken || undefined, tenantCode);
    },
    enabled: true, // Enable by default since we can get anonymous token
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useStoreFrontConfig(
  domain: string,
  token?: string
): UseQueryResult<StoreFrontResponse> {
  return useQuery({
    queryKey: ["storefront", domain],
    queryFn: async () => {
      const finalToken = token || (await getTokenForRequest());
      return getStoreFrontConfig(domain, finalToken || undefined);
    },
    enabled: !!domain,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useCatalogSettings(
  companyId: string,
  token: string
): UseQueryResult<CatalogSettingsResponse> {
  return useQuery({
    queryKey: ["catalogSettings", companyId],
    queryFn: () => getCatalogSettings(companyId, token),
    enabled: !!companyId && !!token,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useDomainConfiguration(
  domain: string,
  companyId?: string
): UseQueryResult<DomainConfiguration> {
  return useQuery({
    queryKey: ["domainConfig", domain, companyId],
    queryFn: () => getDomainConfiguration(domain, companyId),
    enabled: !!domain,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
