/**
 * App Configuration API - Refactored to use new API services
 * Maintains backward compatibility while using the new unified API structure
 */

import {
  AnonymousTokenResponse,
  CatalogSettingsResponse,
  CategoriesResponse,
  ConfigCacheGetResponse,
  ConfigCachePostResponse,
  DomainConfiguration,
  StoreFrontResponse,
  TenantConfigResponse,
} from "@/types/appconfig";

import API from "@/lib/api";

// 1. Anonymous Token API
export async function getAnonymousToken(
  domain: string
): Promise<AnonymousTokenResponse> {
  return API.Auth.getAnonymousToken(domain);
}

// 2. Tenant Code & Configuration API
export async function getTenantConfig(
  domainUrl: string
): Promise<TenantConfigResponse> {
  return API.Tenant.getTenantConfig(domainUrl);
}

// 3. StoreFront Configuration API (GraphQL)
export async function getStoreFrontConfig(
  domain: string,
  accessToken?: string
): Promise<StoreFrontResponse> {
  const context = accessToken ? { accessToken } : undefined;
  return API.StoreFront.getStoreFrontConfig(domain, context);
}

// 4. Categories API
export async function getCategories(
  accessToken?: string,
  tenantCode?: string
): Promise<CategoriesResponse> {
  const context =
    accessToken && tenantCode ? { accessToken, tenantCode } : undefined;
  return API.Catalog.getCategories(context);
}

// 5. Catalog Settings API
export async function getCatalogSettings(
  companyId: string,
  accessToken: string
): Promise<CatalogSettingsResponse> {
  return API.Catalog.getCatalogSettings(companyId, { accessToken });
}

// 6. Config Cache API
export async function getConfigCache(
  domain: string,
  accessToken?: string
): Promise<ConfigCacheGetResponse> {
  // These are local API routes, keeping fetch for now
  const headers: Record<string, string> = { origin: domain };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const response = await fetch("/api/configcache", { headers });
  if (!response.ok) {
    throw new Error(`Failed to get config cache: ${response.status}`);
  }
  return response.json();
}

export async function setConfigCache(
  domain: string,
  config: unknown,
  accessToken?: string
): Promise<ConfigCachePostResponse> {
  // These are local API routes, keeping fetch for now
  const headers: Record<string, string> = {
    origin: domain,
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const response = await fetch("/api/configcache", {
    method: "POST",
    headers,
    body: JSON.stringify({ domain, config }),
  });

  if (!response.ok) {
    throw new Error(`Failed to set config cache: ${response.status}`);
  }
  return response.json();
}

// Complete Domain Configuration - All APIs in one call
export async function getDomainConfiguration(
  domain: string,
  companyId?: string
): Promise<DomainConfiguration> {
  try {
    // Step 1: Get anonymous token
    const tokenResponse = await getAnonymousToken(domain);
    const accessToken = tokenResponse.accessToken;

    // Step 2: Get tenant configuration
    const tenantConfig = await getTenantConfig(domain);
    const tenantCode = tenantConfig.data.tenant.tenantCode;

    // Step 3: Get all other data in parallel
    const [categories, storeFrontConfig, catalogSettings] =
      await Promise.allSettled([
        getCategories(accessToken, tenantCode),
        getStoreFrontConfig(domain, accessToken),
        companyId
          ? getCatalogSettings(companyId, accessToken)
          : Promise.resolve(null),
      ]);

    const result: DomainConfiguration = {
      domain,
      accessToken,
      tenantConfig: tenantConfig.data,
      categories:
        categories.status === "fulfilled" ? categories.value.data : [],
      storeFrontConfig:
        storeFrontConfig.status === "fulfilled"
          ? storeFrontConfig.value.data.getAllByDomain
          : [],
      lastUpdated: new Date().toISOString(),
    };

    // Only add catalogSettings if it exists
    if (catalogSettings.status === "fulfilled" && catalogSettings.value) {
      result.catalogSettings = catalogSettings.value.data;
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get domain configuration: ${message}`);
  }
}
