import { TenantApiResponse } from "@/types/tenant";

export function extractTenantFromHost(host: string): {
  domainUrl: string;
  origin: string;
  tenantCode: string | null;
} {
  // Extract subdomain from host
  // e.g., schwingstetter.myapptino.com → schwingstetter
  const parts = host.split(".");
  const subdomain = parts[0];

  // Handle localhost development
  if (host.includes("localhost")) {
    // For development, you can use a default tenant or extract from query params
    return {
      domainUrl: "schwingstetter.myapptino.com", // Default for testing
      origin: "schwingstetterindia.myapptino.com",
      tenantCode: "schwingstetter",
    };
  }

  return {
    domainUrl: host,
    origin: host,
    tenantCode: subdomain && subdomain !== "www" ? subdomain : null,
  };
}

export async function fetchTenantFromExternalAPI(
  domainUrl: string,
  origin: string
): Promise<TenantApiResponse> {
  const url = `https://api.myapptino.com/homepagepublic/getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`;

  const response = await fetch(url, {
    headers: {
      origin,
      "Content-Type": "application/json",
    },
    cache: "force-cache", // Cache tenant data as it doesn't change frequently
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tenant data: ${response.status}`);
  }

  return response.json();
}

export function getTenantStorageKey(key: string, tenantId: number): string {
  return `tenant_${tenantId}_${key}`;
}

export class TenantStorage {
  static setItem(key: string, value: unknown, tenantId: number) {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        getTenantStorageKey(key, tenantId),
        JSON.stringify(value)
      );
    }
  }

  static getItem(key: string, tenantId: number) {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(getTenantStorageKey(key, tenantId));
      return item ? JSON.parse(item) : null;
    }
    return null;
  }

  static removeItem(key: string, tenantId: number) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(getTenantStorageKey(key, tenantId));
    }
  }

  static clear(tenantId: number) {
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`tenant_${tenantId}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }
}
