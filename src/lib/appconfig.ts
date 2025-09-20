/**
 * App Configuration API - TypeScript Version
 * Simple functions that match your original API documentation
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

// Environment URLs - same as your original
const AUTH_URL = process.env.AUTH_URL || "https://api.myapptino.com/auth/";
const HOME_PAGE_URL =
  process.env.HOME_PAGE_URL || "https://api.myapptino.com/homepagepublic/";
const STOREFRONT_URL =
  process.env.STOREFRONT_URL || "https://api.myapptino.com/storefront/graphql";
const CATALOG_URL =
  process.env.Catalog_URL || "https://api.myapptino.com/catalog";

// Simple fetch wrapper with proper typing
async function apiCall<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Extract tenant from JWT with proper typing
function getTenantFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]!));
    return payload.iss || null;
  } catch {
    return null;
  }
}

// 1. Anonymous Token API
export async function getAnonymousToken(
  domain: string
): Promise<AnonymousTokenResponse> {
  return apiCall<AnonymousTokenResponse>(`${AUTH_URL}/anonymous`, {
    headers: {
      origin: domain,
      "content-type": "application/json",
    },
  });
}

// 2. Tenant Code & Configuration API
export async function getTenantConfig(
  domainUrl: string,
  accessToken?: string
): Promise<TenantConfigResponse> {
  const url = `${HOME_PAGE_URL}getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`;

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
    const tenant = getTenantFromToken(accessToken);
    if (tenant) headers["x-tenant"] = tenant;
  }

  return apiCall<TenantConfigResponse>(url, { headers });
}

// 3. StoreFront Configuration API (GraphQL)
export async function getStoreFrontConfig(
  domain: string,
  accessToken?: string
): Promise<StoreFrontResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  return apiCall<StoreFrontResponse>(STOREFRONT_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `{ getAllByDomain(domain:"${domain}"){storeFrontProperty, dataJson} }`,
      variables: {},
    }),
  });
}

// 4. Categories API
export async function getCategories(
  accessToken?: string,
  tenantCode?: string
): Promise<CategoriesResponse> {
  const url = `${HOME_PAGE_URL}getAllSubCategories`;

  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  if (tenantCode) headers["x-tenant"] = tenantCode;

  return apiCall<CategoriesResponse>(url, { headers });
}

// 5. Catalog Settings API
export async function getCatalogSettings(
  companyId: string,
  accessToken: string
): Promise<CatalogSettingsResponse> {
  return apiCall<CatalogSettingsResponse>(
    `${CATALOG_URL}/Catalogsettings/${companyId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

// 6. Config Cache API
export async function getConfigCache(
  domain: string,
  accessToken?: string
): Promise<ConfigCacheGetResponse> {
  const headers: Record<string, string> = { origin: domain };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  return apiCall<ConfigCacheGetResponse>("/api/configcache", { headers });
}

export async function setConfigCache(
  domain: string,
  config: unknown,
  accessToken?: string
): Promise<ConfigCachePostResponse> {
  const headers: Record<string, string> = { origin: domain };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  return apiCall<ConfigCachePostResponse>("/api/configcache", {
    method: "POST",
    headers,
    body: JSON.stringify({ domain, config }),
  });
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
    const tenantConfig = await getTenantConfig(domain, accessToken);
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
