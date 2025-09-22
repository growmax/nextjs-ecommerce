"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Building2, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";

// Types for navigation items
export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

// Component props interface
export interface MobileNavProps {
  items?: NavigationItem[];
  className?: string;
  containerClassName?: string;
  buttonSize?: "sm" | "default" | "lg";
  showIcons?: boolean;
  activeVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
  inactiveVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
  gap?: "1" | "2" | "3" | "4" | "6" | "8";
  padding?: "2" | "3" | "4" | "6";
  orientation?: "horizontal" | "vertical";
  matchMode?: "includes" | "exact" | "startsWith";
}

// Default navigation items
const defaultNavigationItems: NavigationItem[] = [
  {
    title: "Company",
    href: "/settings/company",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    title: "Profile",
    href: "/settings/profile",
    icon: <User className="w-4 h-4" />,
  },
];

export default function MobileNav({
  items = defaultNavigationItems,
  className,
  containerClassName,
  buttonSize = "sm",
  showIcons = true,
  activeVariant = "default",
  inactiveVariant = "outline",
  gap = "2",
  padding = "3",
  orientation = "horizontal",
  matchMode = "includes",
}: MobileNavProps) {
  const pathname = usePathname();

  const isItemActive = (href: string): boolean => {
    switch (matchMode) {
      case "exact":
        return pathname === href;
      case "startsWith":
        return pathname.startsWith(href);
      case "includes":
      default:
        return pathname.includes(href);
    }
  };

  const containerClasses = cn(
    "bg-background border-b",
    `px-${padding === "2" ? "2" : padding === "4" ? "4" : padding === "6" ? "6" : "3"}`,
    `py-${padding === "2" ? "2" : padding === "4" ? "4" : padding === "6" ? "6" : "3"}`,
    containerClassName
  );

  const scrollAreaClasses = cn(
    "flex overflow-x-auto",
    orientation === "vertical" ? "flex-col" : "flex-row",
    `gap-${gap}`,
    className
  );

  const scrollStyles = {
    scrollbarWidth: "none" as const,
    msOverflowStyle: "none" as const,
  };

  const buttonHeight =
    buttonSize === "sm" ? "h-9" : buttonSize === "lg" ? "h-12" : "h-10";

  return (
    <div className={containerClasses}>
      <div
        className={scrollAreaClasses}
        style={orientation === "horizontal" ? scrollStyles : undefined}
      >
        {items.map(item => {
          const isActive = isItemActive(item.href);
          return (
            <Button
              key={item.href}
              variant={isActive ? activeVariant : inactiveVariant}
              size={buttonSize}
              disabled={item.disabled}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap",
                buttonHeight,
                orientation === "horizontal"
                  ? "flex-shrink-0"
                  : "w-full justify-start",
                isActive &&
                  activeVariant === "default" &&
                  "bg-primary text-primary-foreground",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
              asChild={!item.disabled}
            >
              {item.disabled ? (
                <div>
                  {showIcons && item.icon}
                  <span className="text-sm">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              ) : (
                <Link href={item.href}>
                  {showIcons && item.icon}
                  <span className="text-sm">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
