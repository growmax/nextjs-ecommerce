"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { Link, useRouter } from "@/i18n/navigation";
import { Map, PieChart, Settings2, SquareTerminal } from "lucide-react";
import { useTranslations } from "next-intl";
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { isAuthenticated } = useUserDetails();
  const router = useRouter();
  const t = useTranslations("navigation");

  // This is the real navigation data for your ecommerce application
  const data = {
    navMain: [
      {
        title: t("home"),
        url: "/",
        icon: Map,
      },
      {
        title: t("dashboard"),
        url: "/dashboard",
        icon: PieChart,
      },
      {
        title: t("sales"),
        url: "/orders",
        icon: SquareTerminal,
        items: [
          {
            title: t("orders"),
            url: "/landing/orderslanding",
          },
          {
            title: t("quotes"),
            url: "/landing/quoteslanding",
          },
        ],
      },
      {
        title: t("settings"),
        url: "/settings",
        icon: Settings2,
        items: [
          {
            title: t("company"),
            url: "/settings/company",
          },
          {
            title: t("profile"),
            url: "/settings/profile",
          },
        ],
      },
    ],
  };

  const handleNavigation = (_url: string) => {
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Handle navigation with fallback for header logo link
  const handleHeaderNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetUrl = "/";
    startTransition(() => {
      router.push(targetUrl);
    });
    // Fallback: if navigation doesn't complete, force hard navigation
    setTimeout(() => {
      const currentPath =
        window.location.pathname.replace(
          /^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/,
          ""
        ) || "/";
      if (currentPath !== "/") {
        window.location.href = targetUrl;
      }
    }, 500);
  };

  const navItems = isAuthenticated
    ? data.navMain
    : data.navMain.filter(
        item =>
          ![t("dashboard"), t("sales"), t("settings")].includes(item.title)
      );

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/"
                prefetch={true}
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleHeaderNavClick}
              >
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
