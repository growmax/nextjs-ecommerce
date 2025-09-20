import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { TenantProvider } from "@/contexts/TenantContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserSessionProvider } from "@/contexts/UserSessionContext";
import { fetchTenantFromExternalAPI } from "@/lib/tenant";
import { ServerUserService } from "@/lib/services/ServerUserService";
import NavBar from "@/components/nav-bar";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";

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

  // Fetch user data server-side
  const serverUserService = ServerUserService.getInstance();
  let userData = null;
  try {
    userData = await serverUserService.fetchUserDataServerSide();
  } catch {
    userData = null;
  }

  // Server-side logic for footer visibility
  // Extract locale from pathname for accurate detection
  const pathWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
  const hideFooter = pathWithoutLocale.startsWith("/settings");

  return (
    <NextIntlClientProvider messages={messages}>
      <TenantProvider initialData={tenantData}>
        <AuthProvider>
          <UserSessionProvider initialUserData={userData?.data || null}>
            {/* App pages: Always show nav, conditionally show footer */}
            <NavBar />
            <main className={cn("min-h-screen pt-4", !hideFooter && "pb-8")}>
              {children}
            </main>
            {!hideFooter && <Footer />}
          </UserSessionProvider>
        </AuthProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
