"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { Map, PieChart, Settings2, SquareTerminal } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/TeamSwitcher/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

// This is the real navigation data for your ecommerce application
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Map,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
    },
    {
      title: "Sales",
      url: "/orders",
      icon: SquareTerminal,
      items: [
        {
          title: "Orders",
          url: "/landing/orderslanding",
        },
        {
          title: "Quotes",
          url: "/landing/quoteslanding",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Company",
          url: "/settings/profile",
        },
        {
          title: "Profile",
          url: "/settings/company",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { isAuthenticated } = useUserDetails();

  const handleNavigation = (_url: string) => {
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const navItems = isAuthenticated
    ? data.navMain
    : data.navMain.filter(
        item => !["Dashboard", "Sales", "Settings"].includes(item.title)
      );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} onNavigate={handleNavigation} />
      </SidebarContent>
      <SidebarFooter>{isAuthenticated && <NavUser />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
