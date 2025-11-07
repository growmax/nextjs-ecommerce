"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
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
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname.startsWith(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const hasActiveSub = item.items?.some(subItem => isActive(subItem.url)) ?? false;
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
                  >
                    <Icon className="size-5" />
                    {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          if (isCollapsed) {
            return (
              <SidebarMenuItem key={item.title}>
                <Popover>
                  <PopoverTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={hasActiveSub}
                      className="justify-center w-full"
                    >
                      <Icon className="size-5" />
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
                          className="text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md px-3 py-1.5"
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
                    <Icon className="size-5" />
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
