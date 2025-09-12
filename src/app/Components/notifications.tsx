"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function NotificationButton() {
  const t = useTranslations();

  return (
    <Button
      variant="ghost"
      size="icon"
      title={t("notifications.title")}
      aria-label={t("notifications.title")}
    >
      <Bell className="h-5 w-5" />
    </Button>
  );
}
