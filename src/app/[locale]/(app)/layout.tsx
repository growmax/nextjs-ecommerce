import Footer from "@/components/footer";
import NavBar from "@/components/nav-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { UserSessionProvider } from "@/contexts/UserSessionContext";
import { ServerUserService } from "@/lib/services/ServerUserService";
import { getServerAuthState } from "@/lib/auth-server";
import { fetchTenantFromExternalAPI } from "@/lib/tenant";
import { cn } from "@/lib/utils";
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
  const pathname = headersList.get("x-pathname") || "";

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

  // Server-side logic for footer visibility
  // Extract locale from pathname for accurate detection
  const pathWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
  const hideFooter = pathWithoutLocale.startsWith("/settings");

  return (
    <NextIntlClientProvider messages={messages}>
      <TenantProvider initialData={tenantData}>
        <AuthProvider
          initialAuthState={authState.isAuthenticated}
          initialUser={authState.user}
        >
          <UserSessionProvider initialUserData={userData?.data || null}>
            {/* App pages: Always show nav, conditionally show footer */}
            <div className="min-h-screen flex flex-col">
              <NavBar />
              <main className={cn("flex-1 pt-4")}>{children}</main>
              {!hideFooter && (
                <div className="mt-auto">
                  <Footer />
                </div>
              )}
            </div>
          </UserSessionProvider>
        </AuthProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
