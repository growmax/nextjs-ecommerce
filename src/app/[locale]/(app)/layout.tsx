import { AppSidebar } from "@/components/AppSideBar/app-sidebar";
import { CartProviderWrapper } from "@/components/providers/CartProviderWrapper";
import { NavigationProgressProvider } from "@/components/providers/NavigationProgressProvider";
import { TopProgressBarProvider } from "@/components/providers/TopProgressBarProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TenantProvider } from "@/contexts/TenantContext";
import { UserDetailsProvider } from "@/contexts/UserDetailsContext";
import { LoadingProvider } from "@/hooks/useGlobalLoader";
import TenantService from "@/lib/api/services/TenantService";
import { ServerAuth } from "@/lib/auth-server";
import { ServerUserService } from "@/lib/services/ServerUserService";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";

// Import the AppHeader component
import { AppHeader } from "@/components/AppHeader/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Parallelize independent API calls for better performance
  const [messages, _headersList, accessToken, tenantData] = await Promise.all([
    getMessages(),
    headers(),
    ServerAuth.getAccessToken(),
    (async () => {
      const hdrs = await headers();
      const tenantCode = hdrs.get("x-tenant-code");
      const tenantDomain = hdrs.get("x-tenant-domain");
      const tenantOrigin = hdrs.get("x-tenant-origin");

      if (!tenantCode || !tenantDomain || !tenantOrigin) return null;

      try {
        // Use cached TenantService method
        const result = await TenantService.getTenantDataCached(
          tenantDomain,
          tenantOrigin
        );
        return result;
      } catch {
        return null;
      }
    })(),
  ]);

  // Simple authentication check: if access token exists, user is authenticated
  const isAuthenticated = !!accessToken;

  // Fetch user data server-side only if authenticated
  let userData = null;
  if (isAuthenticated) {
    try {
      userData = await ServerUserService.fetchUserDataServerSide();
    } catch {
      userData = null;
    }
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <TenantProvider initialData={tenantData}>
        <UserDetailsProvider
          initialAuthState={isAuthenticated}
          initialUserData={userData?.data || null}
        >
          <LoadingProvider>
            <TopProgressBarProvider />
            <NavigationProgressProvider>
              <CartProviderWrapper>
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset className="flex flex-col w-full overflow-x-hidden">
                    <AppHeader />
                    <main className="w-full overflow-x-hidden">{children}</main>
                  </SidebarInset>
                </SidebarProvider>
              </CartProviderWrapper>
              {/* Toaster for logout notifications - positioned top-right like login */}
              <Toaster richColors position="top-right" theme="light" />
            </NavigationProgressProvider>
          </LoadingProvider>
        </UserDetailsProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
