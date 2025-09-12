import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { locales } from "@/i18n/config";
import { TenantProvider } from "@/contexts/TenantContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserSessionProvider } from "@/contexts/UserSessionContext";
import LayoutWrapper from "@/components/layout-wrapper";
import { fetchTenantFromExternalAPI } from "@/lib/tenant";
import { ServerUserService } from "@/lib/services/ServerUserService";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Get messages for internationalization
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
      // Fallback to null if fetch fails
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
            <LayoutWrapper>{children}</LayoutWrapper>
          </UserSessionProvider>
        </AuthProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
