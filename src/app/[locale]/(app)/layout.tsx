import { AppSidebar } from "@/components/app-sidebar";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { CartProviderWrapper } from "@/components/providers/CartProviderWrapper";
import { SiteHeader } from "@/components/site-header";
import { TenantDataProvider } from "@/components/TenantDataProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TenantProvider } from "@/contexts/TenantContext";
import { UserDetailsProvider } from "@/contexts/UserDetailsContext";
import { getServerAuthState } from "@/lib/auth-server";
import { ServerUserService } from "@/lib/services/ServerUserService";
import TenantService from "@/lib/api/services/TenantService";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Development-mode performance logging
  const isDevelopment = process.env.NODE_ENV === "development";
  if (isDevelopment) {
    console.time("layout-data-fetch");
  }

  // Parallelize independent API calls for better performance
  const [messages, _headersList, authState, tenantData] = await Promise.all([
    (async () => {
      if (isDevelopment) console.time("getMessages");
      const result = await getMessages();
      if (isDevelopment) console.timeEnd("getMessages");
      return result;
    })(),
    (async () => {
      if (isDevelopment) console.time("headers");
      const result = await headers();
      if (isDevelopment) console.timeEnd("headers");
      return result;
    })(),
    (async () => {
      if (isDevelopment) console.time("getServerAuthState");
      const result = await getServerAuthState();
      if (isDevelopment) console.timeEnd("getServerAuthState");
      return result;
    })(),
    (async () => {
      const hdrs = await headers();
      const tenantCode = hdrs.get("x-tenant-code");
      const tenantDomain = hdrs.get("x-tenant-domain");
      const tenantOrigin = hdrs.get("x-tenant-origin");

      if (!tenantCode || !tenantDomain || !tenantOrigin) return null;

      try {
        if (isDevelopment) console.time("tenantData");
        // Use standard TenantService method
        const result = await TenantService.getTenantDataServerSide(tenantDomain, tenantOrigin);
        if (isDevelopment) console.timeEnd("tenantData");
        return result;
      } catch {
        if (isDevelopment) console.timeEnd("tenantData");
        return null;
      }
    })(),
  ]);

  // Log total time in development
  if (isDevelopment) {
    console.timeEnd("layout-data-fetch");
    console.log("Layout data fetch complete:", {
      hasTenantData: !!tenantData,
      isAuthenticated: authState.isAuthenticated,
      hasUserData: !!authState.user,
    });
  }

  // Fetch user data server-side only if authenticated (depends on authState)
  const serverUserService = ServerUserService.getInstance();
  let userData = null;
  if (authState.isAuthenticated) {
    try {
      if (isDevelopment) console.time("userData");
      userData = await serverUserService.fetchUserDataServerSide();
      if (isDevelopment) console.timeEnd("userData");
    } catch {
      if (isDevelopment) console.timeEnd("userData");
      userData = null;
    }
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <TenantProvider initialData={tenantData}>
        <UserDetailsProvider
          initialAuthState={authState.isAuthenticated}
          initialUserData={userData?.data || null}
        >
          <CartProviderWrapper>
            <TenantDataProvider>
              <div className="[--header-height:calc(theme(spacing.14))]">
                <SidebarProvider className="flex flex-col">
                  <SiteHeader />
                  <div className="flex flex-1">
                    <AppSidebar />
                    <SidebarInset className="overflow-x-hidden">
                      <main className="min-h-screen pb-8 overflow-x-hidden [&_.landing-page]:!pt-0 [&_.landing-page]:!pb-0 [&_.landing-page]:!min-h-0 [&_.landing-page]:!h-[calc(100vh-105px)]">
                        {children}
                      </main>
                      <ConditionalFooter />
                    </SidebarInset>
                  </div>
                </SidebarProvider>
              </div>
            </TenantDataProvider>
          </CartProviderWrapper>
        </UserDetailsProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
