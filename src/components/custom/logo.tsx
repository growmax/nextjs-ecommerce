"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function Logo() {
  const t = useTranslations();

  // Render a non-anchor element here to avoid nested <a> when Logo is used
  // inside menu links (the sidebar already renders an <a> for navigation).
  return (
    <span className={cn("font-bold text-xl text-foreground hover:opacity-80")}>
      {t("navigation.home")}
    </span>
  );
}
