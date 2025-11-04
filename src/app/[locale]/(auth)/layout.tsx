import { TenantProvider } from "@/contexts/TenantContext";
import { UserDetailsProvider } from "@/contexts/UserDetailsContext";
import TenantService from "@/lib/api/services/TenantService";
import { getServerAuthState } from "@/lib/auth-server";
import { ServerUserService } from "@/lib/services/ServerUserService";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";

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
      tenantData = await TenantService.getTenantDataServerSide(
        tenantDomain,
        tenantOrigin
      );
    } catch {
      tenantData = null;
    }
  }

  // Get server-side authentication state
  const authState = await getServerAuthState();

  // Fetch user data server-side only if authenticated
  let userData = null;
  if (authState.isAuthenticated) {
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
          initialAuthState={authState.isAuthenticated}
          initialUserData={userData?.data || null}
        >
          {/* Auth pages: No nav, no footer */}
          <main className="min-h-screen">{children}</main>
        </UserDetailsProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
