import { getRequestConfig } from "next-intl/server";
import { locales } from "@/i18n/config";

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = "en";
  }

  return {
    locale,
    messages: (await import(`../../public/locales/${locale}/common.json`))
      .default,
    timeZone: "UTC",
    now: new Date(),
  };
});
