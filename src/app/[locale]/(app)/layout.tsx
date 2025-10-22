import { AppSidebar } from "@/components/app-sidebar";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { SiteHeader } from "@/components/site-header";
import { CartProviderWrapper } from "@/components/providers/CartProviderWrapper";
import { TenantDataProvider } from "@/components/TenantDataProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { UserSessionProvider } from "@/contexts/UserSessionContext";
import { getServerAuthState } from "@/lib/auth-server";
import { ServerUserService } from "@/lib/services/ServerUserService";
import { fetchTenantFromExternalAPI } from "@/lib/tenant";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Parallelize independent API calls for better performance
  const [messages, _headersList, authState, tenantData] = await Promise.all([
    getMessages(),
    headers(),
    getServerAuthState(),
    (async () => {
      const hdrs = await headers();
      const tenantCode = hdrs.get("x-tenant-code");
      const tenantDomain = hdrs.get("x-tenant-domain");
      const tenantOrigin = hdrs.get("x-tenant-origin");

      if (!tenantCode || !tenantDomain || !tenantOrigin) return null;
      try {
        return await fetchTenantFromExternalAPI(tenantDomain, tenantOrigin);
      } catch {
        return null;
      }
    })(),
  ]);

  // Fetch user data server-side only if authenticated (depends on authState)
  const serverUserService = ServerUserService.getInstance();
  let userData = null;
  if (authState.isAuthenticated) {
    try {
      userData = await serverUserService.fetchUserDataServerSide();
    } catch {
      userData = null;
    }
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <TenantProvider initialData={tenantData}>
        <AuthProvider
          initialAuthState={authState.isAuthenticated}
          initialUser={authState.user}
        >
          <UserSessionProvider initialUserData={userData?.data || null}>
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
          </UserSessionProvider>
        </AuthProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
