"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { Map, PieChart, Settings2, SquareTerminal } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
          url: "/settings/company",
        },
        {
          title: "Profile",
          url: "/settings/profile",
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
    <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <div className="bg-black text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                  <span className="text-base font-bold">S</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Siemens</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} onNavigate={handleNavigation} />
      </SidebarContent>
      <SidebarFooter>{isAuthenticated && <NavUser />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
