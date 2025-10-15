"use client";

import { Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

function NotificationDropdown() {
  const t = useTranslations();
  const router = useRouter();

  const handleMoreClick = () => {
    router.push("/notification");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={t("notifications.title")}
          aria-label={t("notifications.title")}
        >
          <Bell className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center py-8 focus:bg-transparent">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </DropdownMenuItem>
        <DropdownMenuItem className="justify-center focus:bg-transparent">
          No notifications
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleMoreClick}
          className="justify-center cursor-pointer hover:bg-muted focus:bg-muted py-3 text-sm font-medium text-primary"
        >
          <span className="flex items-center gap-1">
            View all notifications
            <ChevronRight className="h-4 w-4" />
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Only load on client-side - fixes hydration
export default dynamic(() => Promise.resolve(NotificationDropdown), {
  ssr: false,
});
