import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { locales } from "@/i18n/config";
import { TenantProvider } from "@/contexts/TenantContext";
import { AuthProvider } from "@/contexts/AuthContext";
import LayoutWrapper from "@/components/layout-wrapper";
import { fetchTenantFromExternalAPI } from "@/lib/tenant";

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

  return (
    <NextIntlClientProvider messages={messages}>
      <TenantProvider initialData={tenantData}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}
