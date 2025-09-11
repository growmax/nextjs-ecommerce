"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafeTranslation } from "@/hooks/use-safe-translation";

export default function NotificationButton() {
  const { t } = useSafeTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      title={t("notifications.title", "Notifications")}
      aria-label={t("notifications.title", "Notifications")}
    >
      <Bell className="h-5 w-5" />
    </Button>
  );
}
