import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { TenantProvider } from "@/contexts/TenantContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserSessionProvider } from "@/contexts/UserSessionContext";
import { fetchTenantFromExternalAPI } from "@/lib/tenant";
import { ServerUserService } from "@/lib/services/ServerUserService";

export default async function AuthLayout({
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

  // Fetch user data server-side
  const serverUserService = ServerUserService.getInstance();
  let userData = null;
  try {
    userData = await serverUserService.fetchUserDataServerSide();
  } catch {
    userData = null;
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <TenantProvider initialData={tenantData}>
        <AuthProvider>
          <UserSessionProvider initialUserData={userData?.data || null}>
            {/* Auth pages: No nav, no footer */}
            <main className="min-h-screen">{children}</main>
          </UserSessionProvider>
        </AuthProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
