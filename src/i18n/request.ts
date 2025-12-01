import { getRequestConfig } from "next-intl/server";
import { cache } from "react";
import { locales } from "./config";

// Cache message loading per locale to avoid re-importing on every request
// This significantly speeds up first request and subsequent requests
const getCachedMessages = cache(async (locale: string) => {
  return (await import(`../../public/locales/${locale}/common.json`)).default;
});

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = "en";
  }

  // Use cached message loading - much faster on first and subsequent requests
  const messages = await getCachedMessages(locale);

  return {
    locale,
    messages,
    timeZone: "UTC",
    now: new Date(),
  };
});
