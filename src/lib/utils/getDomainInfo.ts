/**
 * Utility to get domain information consistently on server and client.
 * In development, allows manual override via env vars.
 * In production, uses actual origin/domain.
 */

import { headers } from "next/headers";

export function getDomainInfo() {
  const isServer = typeof window === "undefined";
  const env = process.env.NODE_ENV;

  let domainUrl: string;
  let origin: string;

  if (isServer) {
    // Server-side: Use next/headers
    const headersList = headers();
    domainUrl =
      headersList.get("x-tenant-domain") ||
      process.env.DEFAULT_DOMAIN ||
      "sandbox.myapptino.com";
    origin =
      headersList.get("x-tenant-origin") ||
      process.env.DEFAULT_ORIGIN ||
      (env === "production" ? `https://${domainUrl}` : `http://${domainUrl}`);
  } else {
    // Client-side: Use window.location
    domainUrl = window.location.hostname;
    origin = window.location.origin;

    // Development override if env vars are set (though env vars are server-only, perhaps use localStorage or assume no override on client)
    // For simplicity, no override on client unless we add more logic
  }

  return { domainUrl, origin };
}
