import TenantService from "@/lib/api/services/TenantService";
import { TenantApiResponse } from "@/types/tenant";

/**
 * Extract tenant information from host - DEPRECATED
 * @deprecated Use TenantService.extractTenantFromHost() instead
 */
export function extractTenantFromHost(host: string): {
  domainUrl: string;
  origin: string;
  tenantCode: string | null;
} {
  return TenantService.extractTenantFromHost(host);
}

/**
 * Fetch tenant data from external API - DEPRECATED
 * @deprecated Use TenantService.getTenantDataServerSide() instead
 */
export async function fetchTenantFromExternalAPI(
  domainUrl: string,
  origin: string
): Promise<TenantApiResponse> {
  return TenantService.getTenantData(domainUrl, origin);
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
