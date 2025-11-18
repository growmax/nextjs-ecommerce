"use client";

// search integration removed for now

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { AvatarCard } from "@/components/AvatarCard/AvatarCard";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useCart } from "@/contexts/CartContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import useLogout from "@/hooks/Auth/useLogout";
import useUserProfile from "@/hooks/Profile/useUserProfile";
import { cn } from "@/lib/utils";
import { getUserInitials } from "@/utils/General/general";
import {
  Bell,
  Command as CommandIcon,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { userProfile } = useUserProfile();
  const { isLoggingOut, handleLogout } = useLogout();
  const { isAuthenticated } = useUserDetails();
  const router = useRouter();
  // Search wiring removed — Command demo uses static items for now.

  // Sample cart and notification counts
  const { cartCount } = useCart();
  const notificationsCount = 5;

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
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

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-[100] border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-200",
          isSidebarCollapsed
            ? "left-[var(--sidebar-width-icon)]"
            : "left-[var(--sidebar-width)]"
        )}
        style={{ right: 0 }}
      >
        <div className="flex h-16 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          {/* Mobile: Search icon moved to left (after sidebar trigger) */}
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
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />

          {/* Desktop Search Bar with Keyboard Shortcut */}
          <div className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                className="pl-10 pr-16"
                onClick={() => setOpen(true)}
                readOnly
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <CommandIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">K</span>
              </div>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Desktop Right Side Icons */}
            <div className="hidden md:flex items-center gap-1">
              {/* Notifications */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 relative"
                >
                  <Bell className="h-4 w-4" />
                  {notificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      {notificationsCount > 9 ? "9+" : notificationsCount}
                    </span>
                  )}
                </Button>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-xs text-white flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>

              {/* Vertical Separator before Avatar */}
              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Profile Dropdown with Real Data */}
              {isAuthenticated ? (
                <AvatarCard
                  user={userProfile}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                  align="end"
                  trigger={
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={userProfile?.picture || ""}
                          alt={userProfile?.displayName || "User"}
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
                  className="h-8 p-0"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center rounded-lg px-3 h-8">
                    <span className="text-sm font-medium">Login</span>
                  </div>
                </Button>
              )}
            </div>

            {/* Mobile Right Side Icons (Condensed) */}
            <div className="md:hidden flex items-center gap-1">
              {/* Cart Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>

              {/* Profile Dropdown with Real Data */}
              {isAuthenticated ? (
                <AvatarCard
                  user={userProfile}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                  align="end"
                  trigger={
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={userProfile?.picture || ""}
                          alt={userProfile?.displayName || "User"}
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

        {/* Bottom Separator */}
        <div className="h-px bg-border"></div>
      </header>

      {/* Enhanced Command Dialog for Search */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="p-0 overflow-hidden"
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem
              onSelect={() => {
                router.push("/landing/orderslanding");
                setOpen(false);
                setSearchValue("");
              }}
            >
              <ShoppingCart />
              <span>Orders</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/dashboard");
                setOpen(false);
                setSearchValue("");
              }}
            >
              <CommandIcon />
              <span>Dashboard</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
