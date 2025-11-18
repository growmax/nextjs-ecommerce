/**
 * Utility to get domain information consistently on server and client.
 * In development, allows manual override via env vars.
 * In production, uses actual origin/domain.
 */

export async function getDomainInfo(): Promise<{
  domainUrl: string;
  origin: string;
}> {
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
      // Dynamic import to avoid build-time issues with next/headers
      const { headers } = await import("next/headers");
      const headersList = await headers();
      const headerDomain =
        headersList.get("x-tenant-domain") ??
        headersList.get("host") ??
        defaultDomain;
      const headerOrigin =
        headersList.get("x-tenant-origin") ??
        headersList.get("origin") ??
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
}
