"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { Building2, User, Settings, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactElement;
  badge?: string;
}

interface SettingsSidebarProps {
  title?: string;
  items?: SidebarItem[];
  className?: string;
  onItemClick?: () => void;
}

// Custom hook for responsive behavior
function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return { isMobile };
}

const defaultItems: SidebarItem[] = [
  {
    title: "Company",
    href: "/settings/company",
    icon: <Building2 />,
  },
  {
    title: "Profile",
    href: "/settings/profile",
    icon: <User />,
  },
];

// Navigation content component
function NavigationContent({
  title,
  items,
  onItemClick,
  showHeader = true,
}: {
  title: string;
  items: SidebarItem[];
  onItemClick?: () => void;
  showHeader?: boolean;
}) {
  const pathname = usePathname();

  const handleNavClick = () => {
    onItemClick?.();
  };

  return (
    <Card className="h-full rounded-none border-0">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {title}
          </CardTitle>
          <Separator />
        </CardHeader>
      )}
      <CardContent className="space-y-2 p-3 sm:p-6">
        <nav className="flex flex-col gap-1">
          {items.map(item => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className="justify-start w-full text-left"
                asChild
                onClick={handleNavClick}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className="flex-1 text-sm sm:text-base">
                    {item.title}
                  </span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}

// Mobile menu trigger button
export function MobileSettingsMenu({
  title = "Settings",
  items = defaultItems,
}: Omit<SettingsSidebarProps, "onItemClick">) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden flex items-center gap-2"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open settings menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <NavigationContent
          title={title}
          items={items}
          onItemClick={() => setOpen(false)}
          showHeader={true}
        />
      </SheetContent>
    </Sheet>
  );
}

// Main sidebar component
export default function SettingsSidebar({
  title = "Settings",
  items = defaultItems,
  className,
  onItemClick,
}: SettingsSidebarProps) {
  const { isMobile } = useResponsive();

  // Mobile: Return null, use MobileSettingsMenu instead
  if (isMobile) {
    return null;
  }

  // Desktop: Fixed sidebar
  return (
    <div
      className={`hidden lg:block w-64 h-screen border-r bg-background ${className || ""}`}
    >
      <NavigationContent
        title={title}
        items={items}
        {...(onItemClick && { onItemClick })}
        showHeader={true}
      />
    </div>
  );
}
