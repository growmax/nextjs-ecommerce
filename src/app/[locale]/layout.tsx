import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";

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

  // Route groups will handle the layout logic
  return children;
}
