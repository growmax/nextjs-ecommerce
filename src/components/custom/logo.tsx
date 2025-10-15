"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Logo() {
  const t = useTranslations();

  return (
    <Link
      href="/"
      className={cn("font-bold text-xl text-foreground hover:opacity-80")}
    >
      {t("navigation.home")}
    </Link>
  );
}
