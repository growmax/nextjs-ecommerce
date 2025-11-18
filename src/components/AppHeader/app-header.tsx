"use client";

import ProductSearchResults from "@/components/search/ProductSearchResults";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import useSearch from "@/hooks/useSearch";

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

import { AvatarCard } from "@/components/AvatarCard/AvatarCard";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useCart } from "@/contexts/CartContext";
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
  const router = useRouter();
  const { isAuthenticated } = useUserDetails();
  // Type definitions for search items
  interface RawOpenSearchProduct {
    productId: number;
    productIndexName?: string;
    productShortDescription?: string;
    brandsName?: string;
    unitListPrice?: number;
    productAssetss?: ProductAssetItem[];
    [key: string]: unknown;
  }

  interface SearchResultItem {
    id: string;
    name: string;
    category: string;
    price?: string | null;
    image?: string | null;
    type: "order" | "quote" | "product";
    productData?: {
      productId: number;
      brandsName?: string | null;
      unitListPrice?: number | null;
      productAssetss?: ProductAssetItem[] | undefined;
    };
  }

  interface ProductAssetItem {
    source: string;
    isDefault?: number | boolean;
  }

  // Enhanced product search data - OpenSearch integration
  const {
    data: productData,
    loading: isProductLoading,
    error: productError,
  } = useSearch({
    searchText: searchValue,
    elasticIndex: "schwingstetterpgandproducts",
    enabled: !!searchValue.trim(),
  });

  // Mock data for orders and quotes (existing functionality)
  const searchResults: SearchResultItem[] = [
    {
      id: "ORD-12345",
      name: "MacBook Pro 16-inch",
      category: "Electronics",
      price: "$2,499.99",
      image: "/api/placeholder/40/40",
      type: "order",
    },
    {
      id: "QUO-12345",
      name: "iPhone 15 Pro",
      category: "Electronics",
      price: "$999.99",
      image: "/api/placeholder/40/40",
      type: "quote",
    },
  ];

  // Format OpenSearch products to match SearchItem interface
  const formattedProducts: SearchResultItem[] = (productData || []).map(
    (rawProduct: RawOpenSearchProduct) => {
      // Type assertion to handle the actual response structure
      // Get the primary image from productAssetss (prefer isDefault: 1 or true)
      const primaryImage =
        rawProduct.productAssetss?.find(
          (asset: ProductAssetItem) =>
            asset.isDefault === 1 || asset.isDefault === true
        ) || rawProduct.productAssetss?.[0];
      const imageUrl = primaryImage?.source || null;

      // Format price with currency
      const formattedPrice = rawProduct.unitListPrice
        ? `₹${rawProduct.unitListPrice.toLocaleString("en-IN")}`
        : null;

      return {
        id: rawProduct.productIndexName || rawProduct.productId.toString(),
        name: rawProduct.productShortDescription || "Unnamed Product",
        category: rawProduct.brandsName || "Product",
        price: formattedPrice,
        image: imageUrl,
        type: "product" as const,
        productData: {
          productId: rawProduct.productId,
          brandsName: rawProduct.brandsName || null,
          unitListPrice: rawProduct.unitListPrice || null,
          productAssetss: rawProduct.productAssetss || undefined,
        },
      };
    }
  );

  // AI search function to match different types of searches
  const getSearchResults = (query: string) => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();

    // Start with orders and quotes (existing functionality)
    const ordersAndQuotes = searchResults.filter((item: SearchResultItem) => {
      // Match by ID (ORD-12345, QUO-12345, PROD-001)
      if (item.id.toLowerCase().includes(searchTerm)) return true;

      // Match by name
      if (item.name.toLowerCase().includes(searchTerm)) return true;

      // Match by category
      if (item.category.toLowerCase().includes(searchTerm)) return true;

      // Feature discovery - navigation shortcuts
      if (searchTerm.includes("order")) return true;
      if (searchTerm.includes("orders")) return true;
      if (searchTerm.includes("quote")) return true;
      if (searchTerm.includes("quotes")) return true;
      if (searchTerm.includes("product")) return true;
      if (searchTerm.includes("cart")) return true;
      if (searchTerm.includes("dashboard")) return true;

      return false;
    });

    // Add real OpenSearch products if available
    const products = formattedProducts.filter((product: SearchResultItem) => {
      // Match by product name/description
      if (product.name.toLowerCase().includes(searchTerm)) return true;

      // Match by brand
      if (product.category.toLowerCase().includes(searchTerm)) return true;

      // Match by product ID
      if (product.id.toLowerCase().includes(searchTerm)) return true;

      return false;
    });

    return [...ordersAndQuotes, ...products];
  };

  // Handle search selection with smart routing
  const handleSearchSelect = (item: SearchResultItem) => {
    if (item.type === "order") {
      router.push(`/details/orderDetails/${item.id}`);
    } else if (item.type === "quote") {
      router.push(`/details/quoteDetails/${item.id}`);
    } else if (item.type === "product") {
      // Route to product details using productIndexName if available
      const productId = item.productData?.productId || item.id;
      router.push(`/products/${productId}`);
    } else {
      // Handle navigation shortcuts
      if (item.name.toLowerCase().includes("order")) {
        router.push("/landing/orderslanding");
      } else if (item.name.toLowerCase().includes("quote")) {
        router.push("/quotesummary");
      } else if (item.name.toLowerCase().includes("product")) {
        router.push("/products");
      } else if (item.name.toLowerCase().includes("cart")) {
        router.push("/cart");
      } else if (item.name.toLowerCase().includes("dashboard")) {
        router.push("/dashboard");
      }
    }

    setOpen(false);
    setSearchValue("");
  };

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
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
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
        title="Search & Navigate"
        description="Search for products, orders, quotes, or navigate to pages"
        className="p-0 overflow-hidden [&_[cmdk-input-wrapper]]:py-4 [&_[cmdk-input-wrapper]]:px-6 [&_[data-slot=dialog-overlay]]:bg-black/30 [&_[data-slot=dialog-content]]:shadow-2xl [&_[data-slot=dialog-content]]:border-0 focus-visible:[&_[data-slot=dialog-content]]:ring-0 focus-visible:[&_[data-slot=dialog-content]]:ring-offset-0"
      >
        <div className="px-4 py-4 border-b">
          <CommandInput
            placeholder="Search for products, orders (ORD-), quotes (QUO-), or type 'quotes' to navigate..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-auto py-3 px-0 text-base border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
          />
        </div>

        <CommandList className="max-h-[400px] px-2 pb-2">
          {/* Loading State */}
          {isProductLoading && searchValue.trim() && (
            <div className="py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground">
                  Searching products...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {productError && searchValue.trim() && (
            <CommandEmpty className="py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <Search className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-red-600 dark:text-red-400">
                    Search Error
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Unable to search products. Please try again.
                  </p>
                </div>
              </div>
            </CommandEmpty>
          )}

          <CommandEmpty className="py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">No results found</p>
                <p className="text-sm text-muted-foreground">
                  Try searching for products, orders (ORD-), quotes (QUO-), or
                  categories
                </p>
              </div>
            </div>
          </CommandEmpty>

          {/* Search Results by Category */}
          {(() => {
            const results = getSearchResults(searchValue);
            if (results.length === 0 || !searchValue.trim()) return null;

            return (
              <div className="space-y-1">
                {/* Orders Section */}
                {results.filter(item => item.type === "order").length > 0 && (
                  <CommandGroup
                    heading={
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Orders
                      </div>
                    }
                    className="px-2 py-1"
                  >
                    {results
                      .filter(item => item.type === "order")
                      .map(item => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleSearchSelect(item)}
                          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                  {item.id.split("-")[0]}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.id} • {item.category}
                              </p>
                            </div>
                            <CommandShortcut className="text-xs">
                              ⏎
                            </CommandShortcut>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}

                {/* Quotes Section */}
                {results.filter(item => item.type === "quote").length > 0 && (
                  <CommandGroup
                    heading={
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Quotes
                      </div>
                    }
                    className="px-2 py-1"
                  >
                    {results
                      .filter(item => item.type === "quote")
                      .map(item => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleSearchSelect(item)}
                          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                  {item.id.split("-")[0]}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.id} • {item.category}
                              </p>
                            </div>
                            <CommandShortcut className="text-xs">
                              ⏎
                            </CommandShortcut>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}

                {/* No Products State - Only show when there are formatted products but none match search */}
                {!isProductLoading &&
                  !productError &&
                  searchValue.trim() &&
                  formattedProducts.length > 0 &&
                  results.filter(item => item.type === "product").length ===
                    0 && (
                    <CommandGroup
                      heading={
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          Products
                        </div>
                      }
                      className="px-2 py-1"
                    >
                      <div className="px-3 py-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          No products match `{searchValue}`
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try different keywords
                        </p>
                      </div>
                    </CommandGroup>
                  )}

                {/* Products Section - Professional Product Results View */}
                {results.filter(item => item.type === "product").length > 0 && (
                  <CommandGroup
                    heading={
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        Products
                      </div>
                    }
                    className="px-2 py-1"
                  >
                    <ProductSearchResults
                      products={results.filter(item => item.type === "product")}
                      isLoading={isProductLoading}
                      onSelectProduct={handleSearchSelect}
                      searchQuery={searchValue}
                    />
                  </CommandGroup>
                )}

                {/* Navigation Shortcuts */}
                {searchValue && (
                  <CommandGroup
                    heading={
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        Navigate
                      </div>
                    }
                    className="px-2 py-1"
                  >
                    {searchValue.toLowerCase().includes("order") && (
                      <CommandItem
                        onSelect={() => {
                          router.push("/landing/orderslanding");
                          setOpen(false);
                          setSearchValue("");
                        }}
                        className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                              <CommandIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                          </div>
                          <span className="font-medium text-sm">Orders</span>
                          <CommandShortcut>⌘O</CommandShortcut>
                        </div>
                      </CommandItem>
                    )}

                    {searchValue.toLowerCase().includes("quote") && (
                      <CommandItem
                        onSelect={() => {
                          router.push("/quotesummary");
                          setOpen(false);
                          setSearchValue("");
                        }}
                        className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                              <CommandIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                          </div>
                          <span className="font-medium text-sm">Quotes</span>
                          <CommandShortcut>⌘Q</CommandShortcut>
                        </div>
                      </CommandItem>
                    )}

                    {searchValue.toLowerCase().includes("dashboard") && (
                      <CommandItem
                        onSelect={() => {
                          router.push("/dashboard");
                          setOpen(false);
                          setSearchValue("");
                        }}
                        className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                              <CommandIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                          </div>
                          <span className="font-medium text-sm">Dashboard</span>
                          <CommandShortcut>⌘D</CommandShortcut>
                        </div>
                      </CommandItem>
                    )}

                    {searchValue.toLowerCase().includes("cart") && (
                      <CommandItem
                        onSelect={() => {
                          router.push("/cart");
                          setOpen(false);
                          setSearchValue("");
                        }}
                        className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                              <CommandIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                          </div>
                          <span className="font-medium text-sm">Cart</span>
                          <CommandShortcut>⌘C</CommandShortcut>
                        </div>
                      </CommandItem>
                    )}
                  </CommandGroup>
                )}
              </div>
            );
          })()}

          {/* Quick Actions - Always visible when no search */}
          {!searchValue && (
            <CommandGroup
              heading={
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  Quick Actions
                </div>
              }
              className="px-2 py-1 mt-4"
            >
              <CommandItem
                onSelect={() => {
                  router.push("/landing/orderslanding");
                  setOpen(false);
                  setSearchValue("");
                }}
                className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <CommandIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <span className="font-medium text-sm">Go to Orders</span>
                  <CommandShortcut>⌘O</CommandShortcut>
                </div>
              </CommandItem>

              <CommandItem
                onSelect={() => {
                  router.push("/dashboard");
                  setOpen(false);
                  setSearchValue("");
                }}
                className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <CommandIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <span className="font-medium text-sm">Go to Dashboard</span>
                  <CommandShortcut>⌘D</CommandShortcut>
                </div>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>

        {/* Footer with shortcuts hint */}
        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded text-xs font-mono bg-muted">
                  ↑↓
                </kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded text-xs font-mono bg-muted">
                  ↵
                </kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded text-xs font-mono bg-muted">
                  esc
                </kbd>
                <span>Close</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-xs font-mono bg-muted">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded text-xs font-mono bg-muted">
                K
              </kbd>
              <span>Open</span>
            </div>
          </div>
        </div>
      </CommandDialog>
    </>
  );
}
