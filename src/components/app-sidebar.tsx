"use client";

import * as React from "react";
import { Home, LayoutDashboard, ShoppingBag, Settings } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "./custom/logo";
import Link from "next/link";

const navMainItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Sales",
    url: "#",
    icon: ShoppingBag,
    items: [
      {
        title: "Quotes",
        url: "/landing/quoteslanding",
      },
      {
        title: "Orders",
        url: "/landing/orderslanding",
      },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    items: [
      {
        title: "Profile",
        url: "/settings/profile",
      },
      {
        title: "Company",
        url: "/settings/company",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isAuthenticated } = useAuth();

  // Filter nav items based on auth state
  const filteredNavMainItems = React.useMemo(() => {
    if (!isAuthenticated) {
      return navMainItems.filter(item => item.title === "Home");
    }
    return navMainItems;
  }, [isAuthenticated]);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Logo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMainItems} />
      </SidebarContent>
      {isAuthenticated && (
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
