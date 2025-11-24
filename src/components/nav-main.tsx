"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import { useTranslations } from "next-intl";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Separate component for collapsed menu items to properly use hooks
function CollapsedMenuItem({
  item,
  Icon,
  hasActiveSub,
  isActive,
  onNavigate,
  prefetch,
}: {
  item: {
    title: string;
    url: string;
    items?: { title: string; url: string }[];
  };
  Icon?: LucideIcon;
  hasActiveSub: boolean;
  isActive: (url: string) => boolean;
  onNavigate?: (url: string) => void;
  prefetch: (url: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarMenuItem>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={hasActiveSub}
            className="justify-center w-full"
          >
            {Icon && <Icon className="size-5" />}
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-56 p-2"
        >
          <div className="flex flex-col gap-1">
            {item.items?.map(subItem => (
              <Link
                key={subItem.title}
                href={subItem.url}
                className={cn(
                  "text-sm font-medium text-sidebar-foreground rounded-md px-3 py-1.5 transition-colors",
                  isActive(subItem.url)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => {
                  onNavigate?.(subItem.url);
                  setIsOpen(false); // Close popover on navigation
                }}
                onMouseEnter={() => prefetch(subItem.url)}
              >
                {subItem.title}
              </Link>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  );
}

export function NavMain({
  items,
  onNavigate,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  onNavigate?: (url: string) => void;
}) {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const { prefetch } = useRoutePrefetch();
  const t = useTranslations("navigation");

  // Remove locale prefix (e.g., /en, /es, /fr) from pathname for comparison
  const getPathWithoutLocale = (path: string): string => {
    return path.replace(/^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/, "") || "/";
  };

  const pathWithoutLocale = getPathWithoutLocale(pathname);

  const isActive = (url: string) => {
    if (url === "/") return pathWithoutLocale === "/";
    return pathWithoutLocale.startsWith(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("mainMenu")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => {
          const hasSubItems = item.items && item.items.length > 0;
          const hasActiveSub =
            item.items?.some(subItem => isActive(subItem.url)) ?? false;
          const Icon = item.icon;

          if (!hasSubItems) {
            // No submenu - just a regular link
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  className={cn(isCollapsed ? "justify-center" : "")}
                >
                  <Link
                    href={item.url}
                    className={cn(
                      "flex items-center gap-2",
                      isCollapsed && "justify-center gap-0"
                    )}
                    onClick={() => onNavigate?.(item.url)}
                    onMouseEnter={() => prefetch(item.url)}
                  >
                    {item.icon && <item.icon className="size-5" />}
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          if (isCollapsed) {
            return (
              <CollapsedMenuItem
                key={item.title}
                item={item}
                {...(Icon && { Icon })}
                hasActiveSub={hasActiveSub}
                isActive={isActive}
                {...(onNavigate && { onNavigate })}
                prefetch={prefetch}
              />
            );
          }

          // Has submenu - make it collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || isActive(item.url)}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger
                  asChild
                  className="w-full [&[data-state=closed]>button]:h-8 [&[data-state=open]>button]:h-8"
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={hasActiveSub}
                    className="gap-2"
                  >
                    {Icon && <Icon className="size-5" />}
                    <span className="text-sm font-medium">{item.title}</span>
                    <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map(subItem => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive(subItem.url)}
                          onClick={() => onNavigate?.(subItem.url)}
                          onMouseEnter={() => prefetch(subItem.url)}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
