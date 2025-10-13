import { AppSidebar } from "@/components/app-sidebar";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import NavBar from "@/components/nav-bar";
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
  const messages = await getMessages();

  // Get tenant information from headers (set by middleware)
  const headersList = await headers();
  const tenantCode = headersList.get("x-tenant-code");
  const tenantDomain = headersList.get("x-tenant-domain");
  const tenantOrigin = headersList.get("x-tenant-origin");

  // Fetch tenant data server-side
  let tenantData = null;
  if (tenantCode && tenantDomain && tenantOrigin) {
    try {
      tenantData = await fetchTenantFromExternalAPI(tenantDomain, tenantOrigin);
    } catch {
      tenantData = null;
    }
  }

  // Get server-side authentication state
  const authState = await getServerAuthState();

  // Fetch user data server-side only if authenticated
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
            <TenantDataProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="overflow-x-hidden">
                  {/* Fixed Navigation */}
                  <div className="fixed top-0 left-0 right-0 z-40 bg-background">
                    <NavBar />
                  </div>
                  <main className="min-h-screen pb-8 overflow-x-hidden pt-[69px] [&_.landing-page]:!pt-0 [&_.landing-page]:!pb-0 [&_.landing-page]:!min-h-0 [&_.landing-page]:!h-[calc(100vh-69px)]">
                    {children}
                  </main>
                  <ConditionalFooter />
                </SidebarInset>
              </SidebarProvider>
            </TenantDataProvider>
          </UserSessionProvider>
        </AuthProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
