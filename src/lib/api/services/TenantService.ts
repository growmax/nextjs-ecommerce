import { TenantConfigResponse } from "@/types/appconfig";
import { TenantApiResponse } from "@/types/tenant";
import { homePageClient, type RequestContext } from "../client";
import { BaseService } from "./BaseService";

export interface TenantInfo {
  domainUrl: string;
  origin: string;
  tenantCode: string | null;
}

/**
 * TenantService - Handles all tenant-related API calls
 *
 * Follows standard service pattern with BaseService.
 * Provides tenant configuration, data fetching, and utility methods.
 */
export class TenantService extends BaseService<TenantService> {
  // Use homePageClient for public tenant endpoints
  protected defaultClient = homePageClient;

  /**
   * Extract tenant information from host
   */
  extractTenantFromHost(host: string): TenantInfo {
    // Extract subdomain from host
    const parts = host.split(".");
    const subdomain = parts[0];

    // Handle localhost development
    if (host.includes("localhost")) {
      // For development, use environment variables
      return {
        domainUrl: process.env.DEFAULT_ORIGIN!,
        origin: process.env.DEFAULT_ORIGIN!,
        tenantCode: process.env.DEFAULT_TENANT_CODE!,
      };
    }

    return {
      domainUrl: host,
      origin: host,
      tenantCode: subdomain && subdomain !== "www" ? subdomain : null,
    };
  }

  /**
   * Get tenant configuration (TenantConfigResponse format)
   * Uses standard BaseService call() method
   */
  async getTenantConfig(domainUrl: string): Promise<TenantConfigResponse> {
    return this.call(
      `/getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`,
      {},
      "GET"
    ) as Promise<TenantConfigResponse>;
  }

  /**
   * Get tenant data (TenantApiResponse format) - Main method for layout
   * Uses BaseService callWith() for custom context with origin header
   */
  async getTenantData(
    domainUrl: string,
    origin?: string
  ): Promise<TenantApiResponse> {
    const options: {
      method: "GET";
      client: typeof homePageClient;
    } & Partial<{ context: RequestContext }> = {
      method: "GET",
      client: homePageClient,
      ...(origin ? { context: { origin } } : {}),
    };

    return this.callWith(
      `/getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`,
      {},
      options
    ) as Promise<TenantApiResponse>;
  }

  /**
   * Server-side safe version - returns null on error
   * Uses callWithSafe() for graceful error handling in server components
   */
  async getTenantDataServerSide(
    domainUrl: string,
    origin?: string
  ): Promise<TenantApiResponse | null> {
    const options: {
      method: "GET";
      client: typeof homePageClient;
    } & Partial<{ context: RequestContext }> = {
      method: "GET",
      client: homePageClient,
      ...(origin ? { context: { origin } } : {}),
    };

    return this.callWithSafe(
      `/getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`,
      {},
      options
    ) as Promise<TenantApiResponse | null>;
  }

  async getTenantDataCached(
    domainUrl: string,
    origin?: string
  ): Promise<TenantApiResponse | null> {
    if (typeof window !== "undefined") {
      return this.getTenantDataServerSide(domainUrl, origin);
    }

    try {
      const { withRedisCache } = await import("@/lib/cache");
      // Include origin in cache key for better cache isolation
      // Tenant data rarely changes, so use longer TTL (2 hours = 7200 seconds)
      const cacheKey = origin
        ? `tenant:${domainUrl}:${origin}`
        : `tenant:${domainUrl}`;
      return withRedisCache(
        cacheKey,
        () => this.getTenantDataServerSide(domainUrl, origin),
        7200 // 2 hours TTL - tenant data changes infrequently
      );
    } catch {
      return this.getTenantDataServerSide(domainUrl, origin);
    }
  }

  /**
   * Static method wrapper for getTenantDataCached
   * This ensures the method works whether the class or instance is imported
   * Use this when importing TenantService as a named export from @/lib/api
   */
  static async getTenantDataCached(
    domainUrl: string,
    origin?: string
  ): Promise<TenantApiResponse | null> {
    return TenantService.getInstance().getTenantDataCached(domainUrl, origin);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getTenantData() instead
   */
  async fetchTenantFromExternalAPI(
    domainUrl: string,
    origin: string
  ): Promise<TenantApiResponse> {
    return this.getTenantData(domainUrl, origin);
  }

  /**
   * Get tenant storage key for localStorage
   */
  getTenantStorageKey(key: string, tenantId: number): string {
    return `tenant_${tenantId}_${key}`;
  }

  /**
   * Tenant-specific localStorage utilities
   */
  storage = {
    setItem: (key: string, value: unknown, tenantId: number) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          this.getTenantStorageKey(key, tenantId),
          JSON.stringify(value)
        );
      }
    },

    getItem: (key: string, tenantId: number) => {
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(
          this.getTenantStorageKey(key, tenantId)
        );
        return item ? JSON.parse(item) : null;
      }
      return null;
    },

    removeItem: (key: string, tenantId: number) => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(this.getTenantStorageKey(key, tenantId));
      }
    },

    clear: (tenantId: number) => {
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
    },
  };

  /**
   * Validate tenant domain - returns true if domain exists
   * Uses callSafe() to gracefully handle non-existent domains
   */
  async validateTenantDomain(domain: string): Promise<boolean> {
    const result = await this.callSafe(
      `/getTenantCodeCurrencyCompany?domainUrl=${domain}`,
      {},
      "GET"
    );
    return result !== null;
  }
}

export default TenantService.getInstance();
