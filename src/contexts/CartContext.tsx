"use client";

import CartServices from "@/lib/api/CartServices";
import { ApiClientError } from "@/lib/api/client";
import type { CartItem as CartItemType } from "@/types/calculation/cart";
import { useQuery } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

// Use the comprehensive CartItem type from types
type CartItem = CartItemType;

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  isLoading: boolean;
  // Cart comments and attachments
  cartComment: string;
  cartAttachments: unknown[];
  handleCartComment: (value: string) => void;
  handleUploadCartAttachments: (attachments: unknown[]) => void;
  // Cart operations
  getCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  updateCartCount: (count: number) => void;
  // Local storage sync for guest cart
  syncGuestCart: () => void;
  clearGuestCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
  userId?: string | number | null;
}

// Local storage keys for guest cart
const GUEST_CART_KEY = "CapacitorStorage.CartInfo";
const GUEST_CART_KEY_ALT = "_cap_CartInfo";
const CART_COMMENT_KEY = "cartComment";
const CART_ATTACHMENTS_KEY = "cartAttachments";

export function CartProvider({ children, userId }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  // Cart comments and attachments state
  const [cartComment, setCartComment] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(CART_COMMENT_KEY) || "";
  });

  const [cartAttachments, setCartAttachments] = useState<unknown[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_ATTACHMENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Handle cart comment updates
  const handleCartComment = useCallback((value: string) => {
    setCartComment(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_COMMENT_KEY, value);
    }
  }, []);

  // Handle cart attachments updates
  const handleUploadCartAttachments = useCallback((attachments: unknown[]) => {
    const values = attachments || [];
    setCartAttachments(values);
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_ATTACHMENTS_KEY, JSON.stringify(values));
    }
  }, []);

  // Sync guest cart from localStorage
  const syncGuestCart = useCallback(() => {
    if (typeof window === "undefined" || userId) return;

    try {
      const cartData =
        localStorage.getItem(GUEST_CART_KEY) ||
        localStorage.getItem(GUEST_CART_KEY_ALT) ||
        JSON.stringify({ data: [] });
      const parsedData = JSON.parse(cartData);
      const guestCart: CartItem[] = parsedData?.data || [];
      setCart(guestCart);
      setCartCount(guestCart.length);
    } catch (error) {
      console.error("Error syncing guest cart:", error);
      setCart([]);
      setCartCount(0);
    }
  }, [userId]);

  // Clear guest cart from localStorage
  const clearGuestCart = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ data: [] }));
    localStorage.setItem(GUEST_CART_KEY_ALT, JSON.stringify({ data: [] }));
    setCart([]);
    setCartCount(0);
  }, []);

  // Process cart data helper function
  const processCartData = useCallback((res: unknown): CartItem[] => {
    let cartData: CartItem[] = [];

    if (Array.isArray(res)) {
      // API returns cart items array directly
      cartData = res;
    } else if (res && typeof res === "object" && "data" in res) {
      // Handle nested data structure: { data: { data: CartItem[] } } or { data: CartItem[] }
      const data = (res as { data: unknown }).data;
      if (Array.isArray(data)) {
        cartData = data;
      } else if (
        data &&
        typeof data === "object" &&
        "data" in data &&
        Array.isArray((data as { data: unknown }).data)
      ) {
        // Nested structure: { data: { data: CartItem[] } }
        cartData = (data as { data: CartItem[] }).data;
      }
    } else if (
      res &&
      typeof res === "object" &&
      "cartItems" in res &&
      Array.isArray(res.cartItems)
    ) {
      // Alternative structure: { cartItems: CartItem[] }
      cartData = res.cartItems;
    }

    // Process bundle products (migrate from buyer-fe)
    return cartData.map(item => {
      const processedItem = { ...item };
      // Preserve seller information
      if (item.sellerId || item.vendorId || item.partnerId) {
        const sellerId = item.sellerId || item.vendorId || item.partnerId;
        const sellerName =
          item.sellerName || item.vendorName || item.partnerName;
        const sellerLocation = item.sellerLocation || item.vendorLocation;

        if (sellerId !== undefined) {
          processedItem.sellerId = sellerId;
        }
        if (sellerName !== undefined) {
          processedItem.sellerName = sellerName;
        }
        if (sellerLocation !== undefined) {
          processedItem.sellerLocation = sellerLocation;
        }
      }
      // Process bundle products
      if (
        item.bundleProducts &&
        Array.isArray(item.bundleProducts) &&
        item.bundleProducts.length > 0
      ) {
        processedItem.bundleProducts = item.bundleProducts.map(bp => {
          const bundleSelected = bp.bundleSelected ?? bp.isBundleSelected_fe;
          return {
            ...bp,
            ...(bundleSelected !== undefined
              ? { isBundleSelected_fe: bundleSelected }
              : {}),
          };
        });
      }
      return processedItem;
    });
  }, []);

  // Use React Query for cart data fetching
  const {
    data: cartQueryData,
    isLoading,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) {
        return null; // Guest cart handled separately
      }

      const res = await CartServices.getCart({
        userId: Number(userId),
        useMultiSellerCart: true,
      });

      return processCartData(res);
    },
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 2 * 60 * 1000, // 2 minutes - cart changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Disable window focus refetching
    retry: 1,
  });

  // Sync cart data from React Query to local state
  useEffect(() => {
    if (userId && cartQueryData) {
      setCart(cartQueryData);
      setCartCount(cartQueryData.length);
    } else if (!userId) {
      // For guest users, sync from localStorage
      syncGuestCart();
    }
  }, [userId, cartQueryData, syncGuestCart]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      let errorMessage = "Failed to fetch cart";

      if (queryError instanceof ApiClientError) {
        // Handle specific API errors
        switch (queryError.status) {
          case 401:
            errorMessage = "Authentication required. Please log in again.";
            break;
          case 403:
            errorMessage = "You don't have permission to access your cart.";
            break;
          case 404:
            errorMessage = "Cart service not found. Please try again later.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = queryError.message || "Failed to fetch cart";
        }
      } else if (queryError instanceof Error) {
        // Handle network or other errors
        if (
          queryError.message.includes("Network Error") ||
          queryError.message.includes("ERR_NETWORK")
        ) {
          errorMessage =
            "Network connection failed. Please check your internet connection.";
        } else {
          errorMessage = queryError.message || "Failed to fetch cart";
        }
      }

      toast.error(errorMessage);
      setCart([]);
      setCartCount(0);
    }
  }, [queryError]);

  // Legacy getCart function for backward compatibility
  const getCart = useCallback(async () => {
    if (!userId) {
      // For guest users, load from localStorage
      syncGuestCart();
      return;
    }

    // Trigger React Query refetch
    await refetch();
  }, [userId, syncGuestCart, refetch]);

  const refreshCart = useCallback(async () => {
    await getCart();
  }, [getCart]);

  const updateCartCount = useCallback((count: number) => {
    setCartCount(count);
  }, []);

  const contextValue = useMemo(
    () => ({
      cart,
      cartCount,
      isLoading,
      cartComment,
      cartAttachments,
      handleCartComment,
      handleUploadCartAttachments,
      getCart,
      refreshCart,
      setCart,
      updateCartCount,
      syncGuestCart,
      clearGuestCart,
    }),
    [
      cart,
      cartCount,
      isLoading,
      cartComment,
      cartAttachments,
      handleCartComment,
      handleUploadCartAttachments,
      getCart,
      refreshCart,
      updateCartCount,
      syncGuestCart,
      clearGuestCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
