"use client";

import { ChevronsUpDown } from "lucide-react";

import { AvatarCard } from "@/components/AvatarCard/AvatarCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useLogout from "@/hooks/Auth/useLogout";
import useUserProfile from "@/hooks/Profile/useUserProfile";
import { getUserInitials } from "@/utils/General/general";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { userProfile } = useUserProfile();
  const { isLoggingOut, handleLogout } = useLogout();
  const t = useTranslations("auth");

  if (!userProfile) {
    return null;
  }

  // Custom trigger component that matches the current sidebar button design
  const CustomTrigger: ReactNode = (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage
          src={userProfile.picture || ""}
          alt={userProfile.displayName || t("user")}
        />
        <AvatarFallback className="rounded-lg">
          {getUserInitials(userProfile.displayName || "")}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-medium">{userProfile.displayName}</span>
        <span className="truncate text-xs">{userProfile.email}</span>
      </div>
      <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
    </SidebarMenuButton>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AvatarCard
          user={{
            displayName: userProfile.displayName || null,
            email: userProfile.email || null,
            companyName: userProfile.companyName || null,
            picture: userProfile.picture || null,
          }}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          trigger={CustomTrigger}
          side={isMobile ? "bottom" : "right"}
          align="end"
          menuClassName="min-w-56 rounded-lg"
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
