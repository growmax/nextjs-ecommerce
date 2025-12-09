export function getOriginHeader(): string {
  if (typeof window !== "undefined") {
    return window.location.hostname === "localhost"
      ? process.env.DEFAULT_ORIGIN || ""
      : window.location.hostname;
  }

  return process.env.DEFAULT_ORIGIN || "";
}

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
    process.env.NEXT_PUBLIC_DEFAULT_TENANT || "schwingstetterdemo";

  return getCommonApiHeaders({
    "x-tenant": tenantCode || defaultTenant,
    ...additionalHeaders,
  });
}
