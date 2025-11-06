"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { Home, LayoutDashboard, Settings, ShoppingBag } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import Logo from "./custom/logo";

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
  const { isAuthenticated } = useUserDetails();

  // Filter nav items based on auth state
  const filteredNavMainItems = React.useMemo(() => {
    if (!isAuthenticated) {
      return navMainItems.filter(item => item.title === "Home");
    }
    return navMainItems;
  }, [isAuthenticated]);

  return (
    <Sidebar collapsible="icon" className="border-r" {...props}>
      <SidebarHeader className="border-b p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="justify-start gap-2 overflow-hidden"
            >
              <Link
                href="/"
                className="flex items-center gap-2 overflow-hidden"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-foreground/10 text-sidebar-foreground">
                  <Home className="size-5" />
                </span>
                <Logo className="!text-sidebar-foreground !text-base !font-semibold whitespace-nowrap group-data-[collapsible=icon]:hidden" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={filteredNavMainItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {isAuthenticated && (
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
