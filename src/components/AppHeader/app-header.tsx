"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import useLogout from "@/hooks/Auth/useLogout";
import useUserProfile from "@/hooks/Profile/useUserProfile";
import { Bell, Building2, Command as CommandIcon, IdCard, LogOut, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { userProfile } = useUserProfile();
  const { isLoggingOut, handleLogout } = useLogout();
  const router = useRouter();
  // Sample product search results - you can replace with real API call
  const searchResults = [
    { name: "Product 1", category: "Electronics" },
    { name: "Product 2", category: "Books" },
    { name: "Product 3", category: "Clothing" },
    { name: "Product 4", category: "Home & Garden" },
    { name: "Product 5", category: "Sports" },
  ];

  // Sample cart and notification counts
  const cartItemsCount = 3;
  const notificationsCount = 5;

  // Generate user initials from real data
  const getUserInitials = () => {
    if (!userProfile?.displayName) return "U";
    return userProfile.displayName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  // Show loading state while user data loads
  if (!userProfile) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
          <div className="flex-1 h-8 bg-muted rounded animate-pulse max-w-sm" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
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
                onChange={(e) => setSearchValue(e.target.value)}
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
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="h-4 w-4" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {notificationsCount > 9 ? "9+" : notificationsCount}
                  </span>
                )}
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={()=>router.push('/cart')}>
                <ShoppingCart className="h-4 w-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-xs text-white flex items-center justify-center">
                    {cartItemsCount > 9 ? "9+" : cartItemsCount}
                  </span>
                )}
              </Button>

              {/* Vertical Separator before Avatar */}
              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Profile Dropdown with Real Data */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.picture || ""} alt={userProfile.displayName || "User"} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile.email}
                      </p>
                      {userProfile.companyName && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {userProfile.companyName}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile">
                      <IdCard className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/company">
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Company Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/quotesummary">
                      <User className="mr-2 h-4 w-4" />
                      <span>Quotes</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Right Side Icons (Condensed) */}
            <div className="md:hidden flex items-center gap-1">
              {/* Cart Icon */}
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <ShoppingCart className="h-4 w-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center">
                    {cartItemsCount > 9 ? "9+" : cartItemsCount}
                  </span>
                )}
              </Button>

              {/* Profile Dropdown with Real Data */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.picture || ""} alt={userProfile.displayName || "User"} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile.email}
                      </p>
                      {userProfile.companyName && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {userProfile.companyName}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile">
                      <IdCard className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/company">
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Company Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/quotesummary">
                      <User className="mr-2 h-4 w-4" />
                      <span>Quotes</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Bottom Separator */}
        <div className="h-px bg-border"></div>
      </header>

      {/* Command Dialog for Search */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search for products..." 
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>No products found.</CommandEmpty>
          <CommandGroup heading="Products">
            {searchResults
              .filter(product => 
                product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                product.category.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((product) => (
                <CommandItem
                  key={product.name}
                  onSelect={() => {
                    // Handle product selection
                    console.log("Selected:", product.name);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{product.name}</span>
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                  </div>
                  <CommandShortcut>↵</CommandShortcut>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => {
              window.location.href = '/orders';
              setOpen(false);
            }}>
              <CommandIcon className="mr-2 h-4 w-4" />
              <span>Go to Orders</span>
              <CommandShortcut>⌘O</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => {
              window.location.href = '/dashboard';
              setOpen(false);
            }}>
              <CommandIcon className="mr-2 h-4 w-4" />
              <span>Go to Dashboard</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
