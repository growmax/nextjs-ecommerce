import { TenantConfigResponse } from "@/types/appconfig";
import { TenantApiResponse } from "@/types/tenant";
import { homePageClient } from "../client";
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
    // e.g., schwingstetter.myapptino.com → schwingstetter
    const parts = host.split(".");
    const subdomain = parts[0];

    // Handle localhost development
    if (host.includes("localhost")) {
      // For development, use environment variables
      return {
        domainUrl: process.env.DEFAULT_DOMAIN!,
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
    return this.callWith(
      `/getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`,
      {},
      {
        method: "GET",
        client: homePageClient,
        context: origin ? { origin } : undefined,
      }
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
    return this.callWithSafe(
      `/getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`,
      {},
      {
        method: "GET",
        client: homePageClient,
        context: origin ? { origin } : undefined,
      }
    ) as Promise<TenantApiResponse | null>;
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
