"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function ProfileButton() {
  const t = useTranslations();

  return (
    <Button
      variant="ghost"
      size="icon"
      title={t("profile.myAccount")}
      aria-label={t("profile.viewProfile")}
    >
      <User className="h-5 w-5" />
    </Button>
  );
}
