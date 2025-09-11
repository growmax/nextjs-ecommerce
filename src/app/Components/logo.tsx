"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/use-locale";
import { useSafeTranslation } from "@/hooks/use-safe-translation";
import Link from "next/link";

export default function Logo() {
  const { t } = useSafeTranslation();
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}`}
      className={cn("font-bold text-xl text-foreground hover:opacity-80")}
    >
      {t("navigation.home", "Home")}
    </Link>
  );
}
