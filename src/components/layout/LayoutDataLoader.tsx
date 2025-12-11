import { TenantProvider } from "@/contexts/TenantContext";
import { UserDetailsProvider } from "@/contexts/UserDetailsContext";
import TenantService from "@/lib/api/services/TenantService";
import { ServerAuth } from "@/lib/auth-server";
import { ServerUserService } from "@/lib/services/ServerUserService";
import { headers } from "next/headers";
import { cache, ReactNode, Suspense } from "react";

// Cached helper functions
const getCachedHeaders = cache(async () => {
  return await headers();
});

const getCachedAccessToken = cache(async () => {
  return await ServerAuth.getAccessToken();
});

const getCachedUserData = cache(async () => {
  return await ServerUserService.fetchUserDataServerSide();
});

/**
 * LayoutDataLoader - Server component that fetches layout data
 * Wrapped in Suspense for streaming
 * Optimized for minimal blocking - all data fetching is parallelized
 */
async function LayoutDataContent({ children }: { children: ReactNode }) {
  // Get headers (cached per request)
  const headersList = await getCachedHeaders();
  const host = headersList.get("host") || "";
  const protocol =
    headersList.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  // Get tenant headers with fallback to environment variables or defaults
  let tenantDomain = headersList.get("x-tenant-domain");
  let tenantOrigin = headersList.get("x-tenant-origin");

  // Fallback logic for missing headers (common on refresh/navigation)
  if (!tenantDomain) {
    if (host === "localhost:3000" || host === "localhost:3001") {
      tenantDomain = process.env.DEFAULT_DOMAIN || "growmax.myapptino.com";
    } else {
      tenantDomain = host.replace("www.", "");
    }
  }

  if (!tenantOrigin) {
    tenantOrigin =
      process.env.DEFAULT_ORIGIN || `${protocol}://${tenantDomain}`;
  }

  // Parallel fetch access token and tenant data
  // Both are cached, so subsequent calls in the same request are instant
  const [accessToken, tenantData] = await Promise.all([
    getCachedAccessToken(),
    tenantDomain && tenantOrigin
      ? TenantService.getTenantDataCached(tenantDomain, tenantOrigin).catch(
          error => {
            // Silently fail - tenant data is optional for initial render
            console.error("TenantService error:", error);
            return null;
          }
        )
      : Promise.resolve(null),
  ]);

  const isAuthenticated = !!accessToken;

  // Fetch user data if authenticated (only after we know auth state)
  // This is still fast because getCachedUserData uses React cache()
  let userData = null;
  if (isAuthenticated) {
    try {
      userData = await getCachedUserData();
    } catch (error) {
      // Silently fail - user data is optional for initial render
      console.error("UserData fetch error:", error);
      userData = null;
    }
  }

  return (
    <TenantProvider initialData={tenantData}>
      <UserDetailsProvider
        initialAuthState={isAuthenticated}
        initialUserData={userData?.data || null}
      >
        {children}
      </UserDetailsProvider>
    </TenantProvider>
  );
}

/**
 * LayoutDataLoader - Wraps data fetching in Suspense for streaming
 * This allows the page to render immediately while data loads in the background
 * The fallback renders children immediately with optimistic defaults, ensuring
 * navigation is never blocked by layout data fetching
 *
 * For first request optimization: The fallback renders immediately, and data
 * streams in asynchronously. This ensures the first paint happens instantly.
 */
export function LayoutDataLoader({
  children,
  initialAuth = false,
}: {
  children: ReactNode;
  initialAuth?: boolean;
}) {
  return (
    <Suspense
      fallback={
        // CRITICAL: Render children immediately with optimistic defaults
        // This ensures first request is instant - no waiting for data
        // Data will stream in and update the UI seamlessly
        <TenantProvider initialData={null}>
          <UserDetailsProvider
            initialAuthState={initialAuth}
            initialUserData={null}
          >
            {children}
          </UserDetailsProvider>
        </TenantProvider>
      }
    >
      <LayoutDataContent>{children}</LayoutDataContent>
    </Suspense>
  );
}
