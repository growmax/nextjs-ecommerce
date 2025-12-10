/**
 * Utility functions for managing origin headers across services
 */

/**
 * Get the appropriate origin header value based on environment
 *
 * @returns string - Origin domain to use in API calls
 */
export function getOriginHeader(): string {
  if (typeof window !== "undefined") {
    // Client-side: use current domain
    return window.location.hostname === "localhost"
      ? process.env.NEXT_PUBLIC_DEFAULT_DOMAIN || "sandbox.myapptino.com"
      : window.location.hostname;
  }

  // Server-side: use environment variable
  return process.env.DEFAULT_DOMAIN || "sandbox.myapptino.com";
}

/**
 * Get common headers for API requests
 *
 * @param additionalHeaders - Additional headers to merge
 * @returns Record<string, string> - Common headers with origin
 */
export function getCommonApiHeaders(
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    Accept: "application/json",
    "User-Agent": "NextJS-App",
    origin: getOriginHeader(),
    ...additionalHeaders,
  };
}

/**
 * Get tenant-specific headers
 *
 * @param tenantCode - Optional tenant code, defaults to configured tenant
 * @param additionalHeaders - Additional headers to merge
 * @returns Record<string, string> - Headers with tenant and origin
 */
export function getTenantApiHeaders(
  tenantCode?: string,
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  const defaultTenant =
    process.env.NEXT_PUBLIC_DEFAULT_TENANT || "sandbox";

  return getCommonApiHeaders({
    "x-tenant": tenantCode || defaultTenant,
    ...additionalHeaders,
  });
}
