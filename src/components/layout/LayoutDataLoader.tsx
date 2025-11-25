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
 */
async function LayoutDataContent({ children }: { children: ReactNode }) {
  const timings: Record<string, number> = {};

  // Get headers
  const headersStart = Date.now();
  const headersList = await getCachedHeaders();
  timings.headers = Date.now() - headersStart;

  const tenantDomain = headersList.get("x-tenant-domain");
  const tenantOrigin = headersList.get("x-tenant-origin");

  // Parallel fetch
  const parallelStart = Date.now();
  const [accessToken, tenantData] = await Promise.all([
    (async () => {
      const start = Date.now();
      const result = await getCachedAccessToken();
      timings.getAccessToken = Date.now() - start;
      return result;
    })(),
    (async () => {
      const start = Date.now();
      if (!tenantDomain || !tenantOrigin) {
        timings.getTenantData = Date.now() - start;
        return null;
      }
      try {
        const result = await TenantService.getTenantDataCached(
          tenantDomain,
          tenantOrigin
        );
        timings.getTenantData = Date.now() - start;
        return result;
      } catch (error) {
        timings.getTenantData = Date.now() - start;
        console.error("TenantService error:", error);
        return null;
      }
    })(),
  ]);
  timings.parallelTotal = Date.now() - parallelStart;

  const isAuthenticated = !!accessToken;

  // Fetch user data if authenticated
  let userData = null;
  if (isAuthenticated) {
    try {
      const userDataStart = Date.now();
      userData = await getCachedUserData();
      timings.getUserData = Date.now() - userDataStart;
    } catch (error) {
      const userDataStart = Date.now();
      timings.getUserData = Date.now() - userDataStart;
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
 * This allows the page to render while data loads
 */
export function LayoutDataLoader({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <TenantProvider initialData={null}>
          <UserDetailsProvider initialAuthState={false} initialUserData={null}>
            {children}
          </UserDetailsProvider>
        </TenantProvider>
      }
    >
      <LayoutDataContent>{children}</LayoutDataContent>
    </Suspense>
  );
}

