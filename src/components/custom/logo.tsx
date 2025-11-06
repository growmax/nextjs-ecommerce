"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  const t = useTranslations();

  // Render a non-anchor element here to avoid nested <a> when Logo is used
  // inside menu links (the sidebar already renders an <a> for navigation).
  return (
    <span
      className={cn("font-bold text-xl text-foreground hover:opacity-80", className)}
    >
      {t("navigation.home")}
    </span>
  );
}
