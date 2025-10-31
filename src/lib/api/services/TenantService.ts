import {
  homePageClient,
  createClientWithContext,
  RequestContext,
} from "../client";
import { TenantApiResponse } from "@/types/tenant";
import { TenantConfigResponse } from "@/types/appconfig";

export interface TenantInfo {
  domainUrl: string;
  origin: string;
  tenantCode: string | null;
}

export class TenantService {
  private static instance: TenantService;

  private constructor() {}

  public static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

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
   * Fetch tenant configuration from external API
   */
  async getTenantConfig(
    domainUrl: string,
    context?: RequestContext
  ): Promise<TenantConfigResponse> {
    const client = context
      ? createClientWithContext(homePageClient, context)
      : homePageClient;

    const response = await client.get(
      `/getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`,
      {}
    );
    return response.data;
  }

  /**
   * Fetch tenant data from external API (legacy method)
   */
  async fetchTenantFromExternalAPI(
    domainUrl: string,
    origin: string
  ): Promise<TenantApiResponse> {
    const response = await homePageClient.get(
      `/getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`,
      {
        headers: { origin },
      }
    );
    return response.data;
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
   * Validate tenant domain
   */
  async validateTenantDomain(domain: string): Promise<boolean> {
    try {
      await this.getTenantConfig(domain);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get tenant configuration with caching
   * 
   * NOTE: For client-side caching, use React Query's useQuery hook with getTenantConfig().
   * This method no longer uses localStorage to avoid server-side execution issues.
   * React Query will handle caching automatically on the client side.
   * 
   * @deprecated Use getTenantConfig() with React Query for caching instead
   */
  async getTenantWithCache(
    domainUrl: string,
    context?: RequestContext
  ): Promise<TenantConfigResponse> {
    // Simply return fresh data - let React Query handle caching on client-side
    return this.getTenantConfig(domainUrl, context);
  }
}

export default TenantService.getInstance();
