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
      router.replace(pathname, { locale: newLocale });
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
