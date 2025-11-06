"use client";

import CartServices from "@/lib/api/CartServices";
import { ApiClientError } from "@/lib/api/client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

interface CartItem {
  productId: number;
  quantity: number;
  replacement?: boolean;
  showPrice?: boolean;
  inventoryResponse?: {
    inStock: boolean;
  };
  itemNo: string;
  sellerId?: string;
  productName?: string;
  shortDescription?: string;
  brandName?: string;
  unitPrice?: number;
  unitListPrice?: number;
  discount?: number;
  discountPercentage?: number;
  [key: string]: unknown;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  isLoading: boolean;
  getCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  updateCartCount: (count: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
  userId?: string | number | null;
}

export function CartProvider({ children, userId }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getCart = useCallback(async () => {
    if (!userId) {
      setCart([]);
      setCartCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await CartServices.getCart(Number(userId));

      // Handle different possible response structures
      let cartData: CartItem[] = [];

      if (Array.isArray(res)) {
        // API returns cart items array directly
        cartData = res;
      } else if (
        res &&
        typeof res === "object" &&
        "data" in res &&
        Array.isArray(res.data)
      ) {
        // API returns { data: CartItem[] }
        cartData = res.data;
      } else if (
        res &&
        typeof res === "object" &&
        "cartItems" in res &&
        Array.isArray(res.cartItems)
      ) {
        // Alternative structure: { cartItems: CartItem[] }
        cartData = res.cartItems;
      } else {
      }

      setCart(cartData);
      setCartCount(cartData.length);
    } catch (error) {
      let errorMessage = "Failed to fetch cart";

      if (error instanceof ApiClientError) {
        // Handle specific API errors
        switch (error.status) {
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
            errorMessage = error.message || "Failed to fetch cart";
        }
      } else if (error instanceof Error) {
        // Handle network or other errors
        if (
          error.message.includes("Network Error") ||
          error.message.includes("ERR_NETWORK")
        ) {
          errorMessage =
            "Network connection failed. Please check your internet connection.";
        } else {
          errorMessage = error.message || "Failed to fetch cart";
        }
      }

      toast.error(errorMessage);
      setCart([]);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refreshCart = useCallback(async () => {
    await getCart();
  }, [getCart]);

  const updateCartCount = useCallback((count: number) => {
    setCartCount(count);
  }, []);

  // Track if we've already fetched to prevent multiple calls
  const hasFetchedCartRef = useRef<boolean>(false);
  const prevUserIdRef = useRef<string | number | null | undefined>(userId);

  useEffect(() => {
    // Only fetch if userId changed and is valid
    if (
      userId &&
      userId !== prevUserIdRef.current &&
      !hasFetchedCartRef.current
    ) {
      hasFetchedCartRef.current = true;
      prevUserIdRef.current = userId;
      getCart().finally(() => {
        hasFetchedCartRef.current = false;
      });
    } else if (!userId) {
      // Reset cart when userId becomes undefined
      setCart([]);
      setCartCount(0);
      prevUserIdRef.current = userId;
      hasFetchedCartRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const contextValue = useMemo(
    () => ({
      cart,
      cartCount,
      isLoading,
      getCart,
      refreshCart,
      setCart,
      updateCartCount,
    }),
    [cart, cartCount, isLoading, getCart, refreshCart, updateCartCount]
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
