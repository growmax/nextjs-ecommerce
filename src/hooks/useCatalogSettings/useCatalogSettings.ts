"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getCatalogSettings } from "@/lib/appconfig";
import type { CatalogSettingsResponse } from "@/types/appconfig";

/**
 * Hook to get catalog settings for a company
 * This is separated from useAppConfig.ts to avoid server-side imports
 */
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
