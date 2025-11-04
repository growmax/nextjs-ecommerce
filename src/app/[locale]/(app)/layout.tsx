import { AppSidebar } from "@/components/app-sidebar";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { CartProviderWrapper } from "@/components/providers/CartProviderWrapper";
import { SiteHeader } from "@/components/site-header";
import { TenantDataProvider } from "@/components/TenantDataProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TenantProvider } from "@/contexts/TenantContext";
import { UserDetailsProvider } from "@/contexts/UserDetailsContext";
import TenantService from "@/lib/api/services/TenantService";
import { ServerAuth } from "@/lib/auth-server";
import { ServerUserService } from "@/lib/services/ServerUserService";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";

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
        // Use standard TenantService method
        const result = await TenantService.getTenantDataServerSide(
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
  console.log(isAuthenticated, "isAuthenticated");
  if (isAuthenticated) {
    try {
      userData = await ServerUserService.fetchUserDataServerSide();
      console.log(userData, "userData");
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
          <CartProviderWrapper>
            <TenantDataProvider>
              <div className="[--header-height:calc(theme(spacing.14))]">
                <SidebarProvider className="flex flex-col">
                  <SiteHeader />
                  <div className="flex flex-1">
                    <AppSidebar />
                    <SidebarInset className="overflow-x-hidden">
                      <main className="overflow-x-hidden [&_.landing-page]:!pt-0 [&_.landing-page]:!pb-0 [&_.landing-page]:!min-h-0">
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
