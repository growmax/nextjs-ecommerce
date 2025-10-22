"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function Logo() {
  const t = useTranslations();

  return (
    <span className={cn("font-bold text-xl text-foreground hover:opacity-80")}>
      {t("navigation.home")}
    </span>
  );
}
