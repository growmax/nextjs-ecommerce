"use client";

import SearchDialogBox from "@/components/AppHeader/SearchDialogBox/SearchDialogBox";
import { AvatarCard } from "@/components/AvatarCard/AvatarCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useCart } from "@/contexts/CartContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import useLogout from "@/hooks/Auth/useLogout";
import useUserProfile from "@/hooks/Profile/useUserProfile";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import { cn } from "@/lib/utils";
import { getUserInitials } from "@/utils/General/general";
import {
  Bell,
  Command as CommandIcon,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { userProfile } = useUserProfile();
  const { isLoggingOut, handleLogout } = useLogout();
  const router = useRouter();
  const { isAuthenticated } = useUserDetails();
  const { prefetchAndNavigate } = useRoutePrefetch();
  const { cartCount } = useCart();
  const notificationsCount = 5;

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === "collapsed";

  const elasticIndex = "schwingstetterpgandproducts";

  const suggestionItems = useMemo(
    () => [
      {
        key: "orders",
        label: "Orders",
        icon: <ShoppingCart />,
        href: "/landing/orderslanding",
      },
      {
        key: "dashboard",
        label: "Dashboard",
        icon: <CommandIcon />,
        href: "/dashboard",
      },
    ],
    []
  );

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setSearchValue("");
    },
    [router]
  );

  return (
    <>
      {/* ---------- FIXED HEADER (FULLY RESPONSIVE) ---------- */}
      <header
        className={cn(
          "fixed top-0 z-[100] border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-200 w-full left-0 md:w-auto md:right-0",
          isSidebarCollapsed
            ? "md:left-[var(--sidebar-width-icon)]"
            : "md:left-[var(--sidebar-width)]"
        )}
      >
        <div className="flex h-16 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">

          {/* Mobile Search Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="h-8 w-8"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

          {/* Desktop Search Input */}
          <div className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-16"
                onClick={() => setOpen(true)}
                readOnly
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <CommandIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">K</span>
              </div>
            </div>
          </div>

          {/* ---------- RIGHT SIDE ICONS ---------- */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-1">
              
              {isAuthenticated && (
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                  <Bell className="h-4 w-4" />
                  {notificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      {notificationsCount > 9 ? "9+" : notificationsCount}
                    </span>
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                onClick={() => prefetchAndNavigate("/cart")}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-xs text-white flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {isAuthenticated ? (
                <AvatarCard
                  user={userProfile}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                  align="end"
                  trigger={
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.picture || ""} alt={userProfile?.displayName || "User"} />
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
                  onClick={() => prefetchAndNavigate("/login")}
                  className="h-8 p-0"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center rounded-lg px-3 h-8">
                    <span className="text-sm font-medium">Login</span>
                  </div>
                </Button>
              )}
            </div>

            {/* ---------- Mobile Icons ---------- */}
            <div className="md:hidden flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>

              {isAuthenticated ? (
                <AvatarCard
                  user={userProfile}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                  align="end"
                  trigger={
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.picture || ""} alt={userProfile?.displayName || "User"} />
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
                  onClick={() => prefetchAndNavigate("/login")}
                  className="h-8 p-0"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center rounded-lg px-3 h-8">
                    <span className="text-sm font-medium">Login</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="h-px bg-border"></div>
      </header>

      {/* ---------- SEARCH DIALOG ---------- */}
      <SearchDialogBox
        open={open}
        setOpen={setOpen}
        elasticIndex={elasticIndex}
        suggestionItems={suggestionItems}
        handleSelect={handleSelect}
        setSearchValue={setSearchValue}
      />
    </>
  );
}

