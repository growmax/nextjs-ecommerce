import { StoreFrontService } from "@/lib/api/services/StoreFrontService";
import type {
  HomepageConfig,
  HomepageSection,
} from "@/hooks/useHomepageConfig";

/**
 * Server-side function to fetch homepage configuration
 * This matches the logic from useHomepageConfig hook but runs on the server
 */
export async function getHomepageConfig(
  domain: string,
  token?: string | null
): Promise<HomepageConfig | null> {
  try {
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
      } catch (error) {
        console.error("Failed to parse HomePageList:", error);
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
    let ELASTIC_INDEX: string | undefined;
    if (elasticIndexEntry?.dataJson) {
      try {
        if (typeof elasticIndexEntry.dataJson === "string") {
          // Try to parse as JSON first, if it fails, treat as plain string
          try {
            const parsed = JSON.parse(elasticIndexEntry.dataJson);
            ELASTIC_INDEX = typeof parsed === "string" ? parsed : undefined;
          } catch {
            // If JSON.parse fails, it's likely a plain string
            ELASTIC_INDEX = elasticIndexEntry.dataJson;
          }
        } else {
          ELASTIC_INDEX =
            typeof elasticIndexEntry.dataJson === "string"
              ? elasticIndexEntry.dataJson
              : undefined;
        }
      } catch (error) {
        console.error("Failed to parse ELASTIC_INDEX:", error);
      }
    }

    return {
      HomePageList,
      StoreFrontdata: response.data.getAllByDomain,
      ThemeData,
      ELASTIC_INDEX,
    };
  } catch (error) {
    console.error("Failed to fetch homepage config:", error);
    return null;
  }
}

