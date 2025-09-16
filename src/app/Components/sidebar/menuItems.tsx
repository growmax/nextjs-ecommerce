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

export const sidebarMenuItems = [
  {
    id: "home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
    label: "Home",
  },
  {
    id: "dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
  },
  {
    id: "sales",
    label: "Sales",
    icon: <ShoppingBag className="h-5 w-5" />,
    submenu: [
      {
        id: "orders",
        href: "/landing/orderslanding",
        icon: <ShoppingCart className="h-5 w-5" />,
        label: "Orders",
      },
      {
        id: "quotes",
        href: "/landing/quoteslanding",
        icon: <FileText className="h-5 w-5" />,
        label: "Quotes",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    submenu: [
      {
        id: "profile",
        href: "/settings/profile",
        icon: <IdCard className="h-5 w-5" />,
        label: "Profile",
      },
      {
        id: "company",
        href: "/settings/company",
        icon: <Building2 className="h-5 w-5" />,
        label: "Company",
      },
    ],
  },
];

export default sidebarMenuItems;
