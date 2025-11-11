/**
 * Utility to get domain information consistently on server and client.
 * In development, allows manual override via env vars.
 * In production, uses actual origin/domain.
 */

import { headers } from "next/headers";

export function getDomainInfo() {
  const isServer = typeof window === "undefined";
  const env = process.env.NODE_ENV;

  if (isServer) {
    const defaultDomain =
      process.env.DEFAULT_DOMAIN || "shwingstetter.myapptino.com";
    const defaultOrigin =
      process.env.DEFAULT_ORIGIN ||
      (env === "production"
        ? `https://${defaultDomain}`
        : `http://${defaultDomain}`);

    try {
      const headersList = headers();
      const headerDomain =
        headersList.get("x-tenant-domain") ||
        headersList.get("host") ||
        defaultDomain;
      const headerOrigin =
        headersList.get("x-tenant-origin") ||
        headersList.get("origin") ||
        (env === "production"
          ? `https://${headerDomain}`
          : `http://${headerDomain}`);

      return { domainUrl: headerDomain, origin: headerOrigin };
    } catch {
      return { domainUrl: defaultDomain, origin: defaultOrigin };
    }
  } else {
    // Client-side: Use window.location
    const domainUrl = window.location.hostname;
    const origin = window.location.origin;
    return { domainUrl, origin };
  }
  // Fallback (should not reach here)
  return {
    domainUrl: process.env.DEFAULT_DOMAIN || "shwingstetter.myapptino.com",
    origin:
      process.env.DEFAULT_ORIGIN ||
      (env === "production"
        ? `https://${process.env.DEFAULT_DOMAIN || "shwingstetter.myapptino.com"}`
        : `http://${process.env.DEFAULT_DOMAIN || "shwingstetter.myapptino.com"}`),
  };
}
