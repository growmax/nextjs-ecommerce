"use client";

import {
  Home,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  FileText,
  Settings,
  IdCard,
  Building2,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./custom/logo";

interface MenuItem {
  id: string;
  href?: string;
  icon: React.ReactNode;
  label: string;
  requireAuth?: boolean;
  submenu?: MenuItem[];
}

const sidebarMenuItems: MenuItem[] = [
  {
    id: "home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
    label: "Home",
    requireAuth: false,
  },
  {
    id: "dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Dashboard",
    requireAuth: true,
  },
  {
    id: "sales",
    label: "Sales",
    icon: <ShoppingBag className="h-4 w-4" />,
    requireAuth: true,
    submenu: [
      {
        id: "orders",
        href: "/landing/orderslanding",
        icon: <ShoppingCart className="h-4 w-4" />,
        label: "Orders",
        requireAuth: true,
      },
      {
        id: "quotes",
        href: "/landing/quoteslanding",
        icon: <FileText className="h-4 w-4" />,
        label: "Quotes",
        requireAuth: true,
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
    requireAuth: true,
    submenu: [
      {
        id: "profile",
        href: "/settings/profile",
        icon: <IdCard className="h-4 w-4" />,
        label: "Profile",
        requireAuth: true,
      },
      {
        id: "company",
        href: "/settings/company",
        icon: <Building2 className="h-4 w-4" />,
        label: "Company",
        requireAuth: true,
      },
    ],
  },
];

function useFilteredMenuItems(): MenuItem[] {
  const { isAuthenticated } = useAuth();

  return sidebarMenuItems
    .filter(item => {
      if (item.requireAuth === false || item.requireAuth === undefined) {
        return true;
      }
      return item.requireAuth === true ? isAuthenticated : true;
    })
    .map(item => {
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(subitem => {
          if (
            subitem.requireAuth === false ||
            subitem.requireAuth === undefined
          ) {
            return true;
          }
          return subitem.requireAuth === true ? isAuthenticated : true;
        });

        return {
          ...item,
          submenu: filteredSubmenu,
        };
      }
      return item;
    });
}

export function AppSidebar() {
  const pathname = usePathname();
  const filteredMenuItems = useFilteredMenuItems();

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <SidebarTrigger />
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map(item => (
                <SidebarMenuItem key={item.id}>
                  {item.submenu && item.submenu.length > 0 ? (
                    <Collapsible
                      defaultOpen={item.submenu.some(sub => isActive(sub.href))}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.label}
                          className="w-full"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map(subitem => (
                            <SidebarMenuSubItem key={subitem.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(subitem.href)}
                              >
                                <Link href={subitem.href || "#"}>
                                  {subitem.icon}
                                  <span>{subitem.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive(item.href)}
                    >
                      <Link href={item.href || "#"}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
