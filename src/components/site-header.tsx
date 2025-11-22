"use client";

import {
  Bell,
  Building2,
  IdCard,
  Loader2,
  LogOut,
  ShoppingCart,
  SidebarIcon,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useCart } from "@/contexts/CartContext";
import useLogout from "@/hooks/Auth/useLogout";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import useUserProfile from "@/hooks/Profile/useUserProfile";
import { useTranslations } from "next-intl";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { isAuthenticated } = useUserDetails();
  const { userProfile } = useUserProfile();
  const { isLoggingOut, handleLogout } = useLogout();
  const { prefetch } = useRoutePrefetch();
  const { cartCount } = useCart();
  const notificationCount = 3;
  const tNav = useTranslations("navigation");
  const tAuth = useTranslations("auth");

  const initials =
    userProfile?.displayName
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Link
          href="/"
          className="flex items-center"
          onMouseEnter={() => prefetch("/")}
        >
          <span className="font-bold text-lg text-foreground hover:opacity-80">
            Siemens
          </span>
        </Link>

        {/* Spacer to push icons to the right */}
        <div className="ml-auto" />

        {/* E-commerce Icons */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            asChild
          >
            <Link
              href="/notification"
              onMouseEnter={() => prefetch("/notification")}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            asChild
          >
            <Link href="/cart" onMouseEnter={() => prefetch("/cart")}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Account / Login */}
          {isAuthenticated && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={userProfile.picture || ""}
                      alt={userProfile.displayName || tAuth("user")}
                    />
                    <AvatarFallback className="rounded-lg text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={userProfile.picture || ""}
                        alt={userProfile.displayName || tAuth("user")}
                      />
                      <AvatarFallback className="rounded-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {userProfile.displayName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {userProfile.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings/profile"
                      onMouseEnter={() => prefetch("/settings/profile")}
                    >
                      <IdCard className="h-4 w-4" />
                      {tNav("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings/company"
                      onMouseEnter={() => prefetch("/settings/company")}
                    >
                      <Building2 className="h-4 w-4" />
                      {tNav("companySettings")}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 focus:text-red-600"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {isLoggingOut ? tAuth("loggingOut") : tAuth("logOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login" onMouseEnter={() => prefetch("/login")}>
                {tAuth("login")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
