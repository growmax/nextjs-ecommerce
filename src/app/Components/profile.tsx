"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafeTranslation } from "@/hooks/use-safe-translation";

export default function ProfileButton() {
  const { t } = useSafeTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      title={t("profile.myAccount", "My Account")}
      aria-label={t("profile.viewProfile", "View Profile")}
    >
      <User className="h-5 w-5" />
    </Button>
  );
}
