"use client";

import CartServices from "@/lib/api/CartServices";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
      const res = (await CartServices.getCart(Number(userId))) as {
        data?: CartItem[];
      };
      if (res?.data) {
        setCart(res.data);
        setCartCount(res.data.length);
      }
    } catch (_error) {
      toast.error("Failed to fetch cart");
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

  useEffect(() => {
    if (userId) {
      getCart();
    }
  }, [userId, getCart]);

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
