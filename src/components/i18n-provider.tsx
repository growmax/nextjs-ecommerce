"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { usePathname } from "next/navigation";

interface I18nProviderProps {
  children: React.ReactNode;
  locale?: string;
}

export function I18nProvider({
  children,
  locale: propLocale,
}: I18nProviderProps) {
  const pathname = usePathname();

  // Extract locale from URL path (e.g., /es/login -> 'es')
  const urlLocale = pathname?.split("/")[1];
  const supportedLocales = ["en", "es", "fr"];
  const detectedLocale =
    urlLocale && supportedLocales.includes(urlLocale) ? urlLocale : "en";
  const locale = propLocale || detectedLocale;
  const [, setIsReady] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        // Ensure i18n is initialized
        if (!i18n.isInitialized) {
          await i18n.init();
        }
        // Change language to the current locale
        await i18n.changeLanguage(locale);
        setIsReady(true);
      } catch {
        // Failed to initialize i18n
        setIsReady(true); // Still render to avoid blank page
      }
    };

    initializeI18n();
  }, [locale]);

  // Show children even if not ready to prevent blank page
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
