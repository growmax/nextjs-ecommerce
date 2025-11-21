"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { StoreFrontService } from "@/lib/api/services/StoreFrontService";
import { StoreFrontResponse } from "@/types/appconfig";

export interface HomepageSection {
  componentName: string;
  storeFrontProperty: string;
  sectionType?: string;
  showSection?: boolean;
  showSectionMob?: boolean;
  [key: string]: unknown;
}

export interface HomepageConfig {
  HomePageList: HomepageSection[];
  StoreFrontdata: StoreFrontResponse["data"]["getAllByDomain"];
  ThemeData?:
    | {
        placeholderImage?: string;
        [key: string]: unknown;
      }
    | undefined;
  ELASTIC_INDEX?: string | undefined;
  isMobile?: boolean;
}

/**
 * Hook to fetch homepage configuration from StoreFrontdata
 * Replaces useDefault hook from buyer-fe
 */
export function useHomepageConfig(
  domain: string,
  token?: string
): UseQueryResult<HomepageConfig | null> {
  return useQuery({
    queryKey: ["homepageConfig", domain, token],
    queryFn: async () => {
      const service = StoreFrontService.getInstance();

      // Extract tenant code from token if available (buyer-fe uses iss from token)
      let tenantCode: string | undefined;
      if (token) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]!));
            tenantCode = payload.iss || payload.tenantId || payload.tenantCode;
          }
        } catch (error) {
          console.error("Failed to extract tenant code from token:", error);
        }
      }

      // Use tenant code if available, otherwise use domain
      const queryDomain = tenantCode || domain;
      const context = token
        ? { accessToken: token, ...(tenantCode && { tenantCode }) }
        : undefined;

      const response = await service.getStoreFrontConfig(queryDomain, context);

      // Find HOMEPAGELIST entry
      const homepageListEntry = response.data.getAllByDomain.find(
        item => item.storeFrontProperty === "HOMEPAGELIST"
      );

      // Find THEME entry
      const themeEntry = response.data.getAllByDomain.find(
        item => item.storeFrontProperty === "THEME"
      );

      // Parse dataJson - match buyer-fe logic exactly
      let HomePageList: HomepageSection[] = [];
      if (homepageListEntry?.dataJson) {
        try {
          const parsed =
            typeof homepageListEntry.dataJson === "string"
              ? JSON.parse(homepageListEntry.dataJson)
              : homepageListEntry.dataJson;

          // In buyer-fe, it checks isArray(HomePageList), so ensure it's an array
          if (Array.isArray(parsed)) {
            HomePageList = parsed;
          } else if (parsed && typeof parsed === "object") {
            // If it's an object, try to extract an array from it
            // Some configurations might wrap the array in an object
            if ("list" in parsed && Array.isArray(parsed.list)) {
              HomePageList = parsed.list;
            } else if ("sections" in parsed && Array.isArray(parsed.sections)) {
              HomePageList = parsed.sections;
            } else {
              // If it's a single object, wrap it in an array
              HomePageList = [parsed as HomepageSection];
            }
          }

          // Debug logging
          if (process.env.NODE_ENV === "development") {
            console.log("Parsed HomePageList:", {
              originalType: typeof homepageListEntry.dataJson,
              parsedType: typeof parsed,
              isArray: Array.isArray(parsed),
              length: HomePageList.length,
              firstItem: HomePageList[0],
            });
          }
        } catch (error) {
          console.error("Failed to parse HomePageList:", error, {
            dataJson: homepageListEntry.dataJson,
          });
        }
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn("No HOMEPAGELIST entry found in StoreFrontdata");
        }
      }

      let ThemeData: HomepageConfig["ThemeData"] = {};
      if (themeEntry?.dataJson) {
        try {
          ThemeData =
            typeof themeEntry.dataJson === "string"
              ? JSON.parse(themeEntry.dataJson)
              : themeEntry.dataJson;
        } catch (error) {
          console.error("Failed to parse ThemeData:", error);
        }
      }

      // Find ELASTIC_INDEX (might be in a different property)
      const elasticIndexEntry = response.data.getAllByDomain.find(
        item => item.storeFrontProperty === "ELASTIC_INDEX"
      );
      const ELASTIC_INDEX = elasticIndexEntry?.dataJson
        ? typeof elasticIndexEntry.dataJson === "string"
          ? JSON.parse(elasticIndexEntry.dataJson)
          : elasticIndexEntry.dataJson
        : undefined;

      return {
        HomePageList,
        StoreFrontdata: response.data.getAllByDomain,
        ThemeData,
        ELASTIC_INDEX:
          typeof ELASTIC_INDEX === "string" ? ELASTIC_INDEX : undefined,
      };
    },
    enabled: !!domain,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
