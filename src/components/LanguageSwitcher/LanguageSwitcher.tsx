"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, type Locale } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Check, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useState, useTransition } from "react";

// Language display names mapping
const languageNames: Record<Locale, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  ms: "Malay",
};

/**
 * Strips all locale segments from a pathname to ensure clean routing
 * Handles malformed URLs like /id/vi/ms/vi/fr/es/ms/id/es -> /
 */
function stripAllLocales(pathname: string, locales: readonly string[]): string {
  let cleanPath = pathname;

  // Remove all locale segments from the beginning of the path
  // This handles malformed URLs with multiple locale segments
  let changed = true;
  while (changed) {
    changed = false;
    for (const loc of locales) {
      const localePattern = new RegExp(`^/${loc}(/|$)`);
      if (cleanPath.match(localePattern)) {
        cleanPath = cleanPath.replace(localePattern, "/");
        changed = true;
      }
    }
  }

  // Ensure we have at least a "/"
  return cleanPath || "/";
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }

    // Close dropdown immediately
    setOpen(false);

    // Navigate in a transition for instant feel
    startTransition(() => {
      // Get the actual pathname, handling both normal and malformed URLs
      // usePathname() should return a clean path, but if URL is malformed,
      // we fall back to window.location.pathname to get the actual current path
      let currentPathname = pathname;

      if (typeof window !== "undefined") {
        const actualPath = window.location.pathname;
        // If the actual path contains multiple locale segments (malformed URL),
        // use it instead of the pathname from usePathname()
        const localeMatches = actualPath.match(
          /\/([a-z]{2}(-[A-Z]{2})?)(\/|$)/g
        );
        if (localeMatches && localeMatches.length > 1) {
          currentPathname = actualPath;
        }
      }

      // Strip all locale segments to ensure clean pathname
      // This prevents malformed URLs when switching languages
      const cleanPathname = stripAllLocales(currentPathname, locales);
      router.replace(cleanPathname, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="top"
        className="w-48 !z-[101]"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        {locales.map(loc => (
          <DropdownMenuItem
            key={loc}
            onSelect={e => {
              e.preventDefault();
              handleLanguageChange(loc);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{languageNames[loc]}</span>
              {locale === loc && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
