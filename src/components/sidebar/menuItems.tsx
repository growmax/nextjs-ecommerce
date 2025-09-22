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
} from "lucide-react";

export interface MenuItem {
  id: string;
  href?: string;
  icon: React.ReactNode;
  label: string;
  requireAuth?: boolean; // New property for authentication requirement
  submenu?: MenuItem[];
}

export const sidebarMenuItems: MenuItem[] = [
  {
    id: "home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
    label: "Home",
    requireAuth: false, // Always visible
  },
  {
    id: "dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    requireAuth: true, // Only visible when authenticated
  },
  {
    id: "sales",
    label: "Sales",
    icon: <ShoppingBag className="h-5 w-5" />,
    requireAuth: true, // Only visible when authenticated
    submenu: [
      {
        id: "orders",
        href: "/landing/orderslanding",
        icon: <ShoppingCart className="h-5 w-5" />,
        label: "Orders",
        requireAuth: true,
      },
      {
        id: "quotes",
        href: "/landing/quoteslanding",
        icon: <FileText className="h-5 w-5" />,
        label: "Quotes",
        requireAuth: true,
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    requireAuth: true, // Only visible when authenticated
    submenu: [
      {
        id: "profile",
        href: "/settings/profile",
        icon: <IdCard className="h-5 w-5" />,
        label: "Profile",
        requireAuth: true,
      },
      {
        id: "company",
        href: "/settings/company",
        icon: <Building2 className="h-5 w-5" />,
        label: "Company",
        requireAuth: true,
      },
    ],
  },
];

// Hook to filter menu items based on authentication state
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export function useFilteredMenuItems(): MenuItem[] {
  const { isAuthenticated } = useAuth();

  return useMemo(() => {
    return sidebarMenuItems
      .filter(item => {
        // If item doesn't require auth, always show it
        if (item.requireAuth === false || item.requireAuth === undefined) {
          return true;
        }

        // If item requires auth, only show when authenticated
        if (item.requireAuth === true) {
          return isAuthenticated;
        }

        return true;
      })
      .map(item => {
        // Filter submenu items if they exist
        if (item.submenu) {
          const filteredSubmenu = item.submenu.filter(subitem => {
            if (
              subitem.requireAuth === false ||
              subitem.requireAuth === undefined
            ) {
              return true;
            }

            if (subitem.requireAuth === true) {
              return isAuthenticated;
            }

            return true;
          });

          return {
            ...item,
            submenu: filteredSubmenu,
          };
        }

        return item;
      });
  }, [isAuthenticated]);
}

export default sidebarMenuItems;
