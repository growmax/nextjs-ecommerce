"use client";

import { usePathname } from "next/navigation";

export function useLocale() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const locale = segments[1] || "en";

  // Check if it's a valid locale
  const validLocales = ["en", "es", "fr"];
  return validLocales.includes(locale) ? locale : "en";
}
