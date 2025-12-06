import { TenantConfigResponse } from "@/types/appconfig";
import { TenantApiResponse } from "@/types/tenant";
import { homePageClient, type RequestContext } from "../client";
import { BaseService } from "./BaseService";

export interface TenantInfo {
  domainUrl: string;
  origin: string;
  tenantCode: string | null;
}

export class TenantService extends BaseService<TenantService> {
  protected defaultClient = homePageClient;
  extractTenantFromHost(host: string): TenantInfo {
    const parts = host.split(".");
    const subdomain = parts[0];

    if (host.includes("localhost")) {
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

  async getTenantConfig(domainUrl: string): Promise<TenantConfigResponse> {
    return this.call(
      `/getTenantCodeCurrencyCompany?domainUrl=${domainUrl}`,
      {},
      "GET"
    ) as Promise<TenantConfigResponse>;
  }

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

  static async getTenantDataCached(
    domainUrl: string,
    origin?: string
  ): Promise<TenantApiResponse | null> {
    return TenantService.getInstance().getTenantDataCached(domainUrl, origin);
  }

  static extractTenantFromHost(host: string): TenantInfo {
    return TenantService.getInstance().extractTenantFromHost(host);
  }

  static async getTenantConfig(
    domainUrl: string
  ): Promise<TenantConfigResponse> {
    return TenantService.getInstance().getTenantConfig(domainUrl);
  }

  static async getTenantData(
    domainUrl: string,
    origin?: string
  ): Promise<TenantApiResponse> {
    return TenantService.getInstance().getTenantData(domainUrl, origin);
  }

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

  async validateTenantDomain(domain: string): Promise<boolean> {
    const result = await this.callSafe(
      `/getTenantCodeCurrencyCompany?domainUrl=${domain}`,
      {},
      "GET"
    );
    return result !== null;
  }
}

// Export the class as default for static method access
// This ensures static methods like getTenantDataCached() work correctly in production builds
export default TenantService;
