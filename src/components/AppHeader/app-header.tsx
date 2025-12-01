"use client";


import { AvatarCard } from "@/components/AvatarCard/AvatarCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import useLogout from "@/hooks/Auth/useLogout";
import useUserProfile from "@/hooks/Profile/useUserProfile";
import { useTenantData } from "@/hooks/useTenantData";


import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { getUserInitials } from "@/utils/General/general";
import {
  Bell,
  Command as CommandIcon,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [searchValue, setSearchValue] = useState("");
  const { userProfile } = useUserProfile();
  const { isLoggingOut, handleLogout } = useLogout();
  const router = useNavigationWithLoader();
  const { isAuthenticated, isLoading: isAuthLoading } = useUserDetails();

  // Sync tenant data from context to Zustand store (early initialization)
  useTenantData();

  const { cartCount } = useCart();
  const notificationsCount = 5;
  const tAuth = useTranslations("auth");
  const tSearch = useTranslations("search");

  // Don't render auth-dependent UI until authentication state is determined
  // This prevents flickering between login/logout states
  const showAuthUI = !isAuthLoading;

  // Keyboard shortcut to navigate to search (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push("/search");
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router]);

  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === "collapsed";


  return (
    <>
      {/* ---------- FIXED HEADER (FULLY RESPONSIVE) ---------- */}
      <header
        className={cn(
          "fixed top-0 z-[10] border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-200",
          // Mobile: Full width (sidebar is overlay)
          "left-0 right-0",
          // Desktop: Adjust for sidebar
          "md:left-[var(--sidebar-width-icon)] md:right-0",
          !isSidebarCollapsed && "md:left-[var(--sidebar-width)]"
        )}
      >
        <div className="flex h-14 sm:h-16 items-center gap-1 sm:gap-2 px-2 sm:px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          {/* Mobile Logo - Show when sidebar is not visible (Full Left Position) */}
          <div className="md:hidden">
            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-2 cursor-pointer mr-2"
            >
              <div className="bg-black text-white flex aspect-square size-7 sm:size-8 items-center justify-center rounded-lg">
                <span className="text-sm sm:text-base font-bold">S</span>
              </div>
            </Link>
          </div>

          {/* Mobile & Small Tablet: Search icon */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/search")}
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>

          <SidebarTrigger className="-ml-1" />

          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />

          {/* Tablet & Desktop Search Bar with Keyboard Shortcut */}
          <div className="hidden md:flex lg:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 lg:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 lg:h-4 lg:w-4" />
              <Input
                placeholder={tSearch("placeholder")}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchValue.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
                  }
                }}
                className="pl-8 lg:pl-10 pr-12 lg:pr-16 text-sm h-8 lg:h-10"
              />
              <div className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 hidden lg:flex items-center gap-1">
                <CommandIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">K</span>
              </div>
            </div>
          </div>

          {/* ---------- RIGHT SIDE ICONS ---------- */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Notifications */}
              {!showAuthUI ? (
                <Skeleton className="h-7 w-7 md:h-8 md:w-8 rounded-md" />
              ) : (
                isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8 relative"
                  >
                    <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    {notificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                        {notificationsCount > 9 ? "9+" : notificationsCount}
                      </span>
                    )}
                  </Button>
                )
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8 lg:h-8 lg:w-8 relative"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-xs text-white flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
              {/* Vertical Separator before Avatar */}
              <Separator
                orientation="vertical"
                className="h-5 md:h-6 mx-0.5 md:mx-1"
              />

              {/* Profile Dropdown with Real Data */}
              {!showAuthUI ? (
                <Skeleton className="h-7 w-7 md:h-8 md:w-8 rounded-full" />
              ) : isAuthenticated ? (
                <AvatarCard
                  user={userProfile}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                  align="end"
                  trigger={
                    <Button
                      variant="ghost"
                      className="relative h-7 w-7 md:h-8 md:w-8 rounded-full"
                    >
                      <Avatar className="h-7 w-7 md:h-8 md:w-8">
                        <AvatarImage
                          src={userProfile?.picture || ""}
                          alt={userProfile?.displayName || tAuth("user")}
                        />
                        <AvatarFallback>
                          {getUserInitials(userProfile?.displayName || "")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/login")}
                  className="h-7 md:h-8 p-0"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center rounded-lg px-3 h-8">
                    <span className="text-sm font-medium">
                      {tAuth("login")}
                    </span>
                  </div>
                </Button>
              )}
            </div>

            {/* ---------- Mobile Icons ---------- */}
            <div className="md:hidden flex items-center gap-1">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Cart Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 relative"
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>

              {/* Profile Dropdown with Real Data */}
              {!showAuthUI ? (
                <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
              ) : isAuthenticated ? (
                <AvatarCard
                  user={userProfile}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                  align="end"
                  trigger={
                    <Button
                      variant="ghost"
                      className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    >
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage
                          src={userProfile?.picture || ""}
                          alt={userProfile?.displayName || tAuth("user")}
                        />
                        <AvatarFallback>
                          {getUserInitials(userProfile?.displayName || "")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/login")}
                  className="h-7 sm:h-8 p-0"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center rounded-lg px-3 h-8">
                    <span className="text-sm font-medium">
                      {tAuth("login")}
                    </span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="h-px bg-border"></div>
      </header>


    </>
  );
}

