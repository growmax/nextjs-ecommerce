"use client";

import { useCart as useCartContext } from "@/contexts/CartContext";
import { useTenantId } from "@/contexts/TenantContext";
import { useUserId } from "@/contexts/UserDetailsContext";
import CartServices, {
  type AddMultipleItemsRequest,
  type AddToCartRequest,
  type DeleteCartRequest,
} from "@/lib/api/CartServices";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import type { CartItem } from "@/types/calculation/cart";
import { getIsInCart } from "@/utils/cart/cartHelpers";
import { ValidateQuantity } from "@/utils/cart/validateQuantity";
import find from "lodash/find";
import map from "lodash/map";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// Local storage keys
const GUEST_CART_KEY = "CapacitorStorage.CartInfo";
const GUEST_CART_KEY_ALT = "_cap_CartInfo";

interface AddItemToCartData {
  productId: number;
  itemNo?: number | string;
  quantity?: number;
  packagingQty?: number;
  minOrderQuantity?: number;
  brandsName?: string;
  productShortDescription?: string;
  productAssetss?: Array<{
    source: string;
    isDefault?: boolean;
  }>;
  img?: string;
  sellerId?: number | string;
  sellerName?: string;
  sellerLocation?: string;
  unitListPrice?: number;
  bundleProducts?: unknown[];
  [key: string]: unknown;
}

interface ChangeQtyData extends AddItemToCartData {
  quantity: number;
}

/**
 * Comprehensive cart hook with all operations from buyer-fe
 * Migrated from context/buyer-fe/src/hooks/useCart.js
 */
export function useCart() {
  const {
    cart,
    setCart,
    refreshCart,
    cartComment,
    handleCartComment,
    cartAttachments,
    handleUploadCartAttachments,
    syncGuestCart,
    clearGuestCart,
  } = useCartContext();

  const userIdFromContext = useUserId();
  const tenantIdNum = useTenantId();

  // Fallback: Try to get userId from JWT token if context doesn't have it
  // This ensures we can still make API calls even if UserDetailsContext hasn't loaded yet
  const userIdFromToken = useMemo(() => {
    try {
      const token = AuthStorage.getAccessToken();
      if (token) {
        const jwtService = JWTService.getInstance();
        const payload = jwtService.decodeToken(token) as any;
        if (payload?.userId || payload?.id) {
          const extractedUserId = Number(payload.userId || payload.id);
          console.log(
            "🔑 [useCart] Extracted userId from JWT token:",
            extractedUserId
          );
          return extractedUserId;
        }
      }
    } catch (error) {
      // If JWT decode fails, return null
      console.warn(
        "⚠️ [useCart] Failed to extract userId from JWT token:",
        error
      );
    }
    return null;
  }, []); // Token doesn't change, no need to depend on userIdFromContext

  // Use userId from context if available, otherwise fallback to JWT token
  const userId = userIdFromContext || userIdFromToken;

  // Convert tenantId to string (backend expects string)
  const tenantId = tenantIdNum ? String(tenantIdNum) : null;
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [showCartCard, setShowCartCard] = useState(false);

  // Helper to set cart in localStorage for guest users
  const cartSetLocalItem = useCallback((data: CartItem[]) => {
    if (typeof window === "undefined") return;
    const cartData = { data };
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
    localStorage.setItem(GUEST_CART_KEY_ALT, JSON.stringify(cartData));
  }, []);

  /**
   * Check if product is in cart
   * Supports multi-seller cart by matching sellerId
   */
  const getIsInCartItem = useCallback(
    (
      productId: number | string,
      itemNo?: string | number | null,
      sellerId?: string | number | null
    ): CartItem | undefined => {
      return getIsInCart(cart, productId, itemNo, sellerId);
    },
    [cart]
  );

  /**
   * Add item to cart with validation
   * Migrated from buyer-fe/src/hooks/useCart.js addItemToCart
   */
  /**
   * Helper function to parse cart response from API
   * Handles different response structures from backend
   */
  const parseCartResponse = useCallback((res: unknown): CartItem[] => {
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

    // Process bundle products and seller information (same as getCart)
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

  const addItemToCart = useCallback(
    async (
      data: AddItemToCartData,
      setErrorMessage: (error: string | false) => void,
      decrease = false,
      isUpdate = false
    ) => {
      const {
        packagingQty,
        minOrderQuantity,
        brandsName,
        productShortDescription,
        productAssetss,
        productId,
        itemNo,
        img,
        sellerId,
        sellerName,
        sellerLocation,
        unitListPrice,
      } = data;

      setIsCartLoading(true);
      const isInCart = getIsInCartItem(productId, itemNo, sellerId);

      // Get product image
      const productImage =
        productAssetss && Array.isArray(productAssetss)
          ? (
              find(productAssetss, o => o.isDefault) as
                | { source: string; isDefault?: boolean }
                | undefined
            )?.source ||
            (
              productAssetss[0] as
                | { source: string; isDefault?: boolean }
                | undefined
            )?.source
          : img || "";

      // Prepare cart item data - exclude bundleProducts if it's not the right type
      const { bundleProducts: _, ...dataWithoutBundle } = data;
      const cartItemData: Partial<CartItem> = {
        ...dataWithoutBundle,
        ...(productImage && { img: productImage }),
        ...(productShortDescription && {
          shortDescription: productShortDescription,
        }),
        ...(brandsName && { brandName: brandsName, brandsName: brandsName }),
        ...(productAssetss && { productAssetss }),
      };

      // Preserve seller info for multi-seller cart
      if (sellerId) {
        cartItemData.sellerId = sellerId;
        if (sellerName) {
          cartItemData.sellerName = sellerName;
        }
        if (sellerLocation) {
          cartItemData.sellerLocation = sellerLocation;
        }
        if (unitListPrice !== undefined || data.unitListPrice !== undefined) {
          const price = unitListPrice ?? data.unitListPrice;
          if (price !== undefined) {
            cartItemData.unitListPrice = price;
          }
        }
      }

      // Calculate quantity
      if (isInCart) {
        if (decrease) {
          cartItemData.quantity = packagingQty
            ? (isInCart.quantity || 0) - parseFloat(String(packagingQty))
            : minOrderQuantity
              ? (isInCart.quantity || 0) - parseFloat(String(minOrderQuantity))
              : (isInCart.quantity || 0) - 1;
        } else {
          cartItemData.quantity = packagingQty
            ? (isInCart.quantity || 0) + parseFloat(String(packagingQty))
            : minOrderQuantity
              ? (isInCart.quantity || 0) + parseFloat(String(minOrderQuantity))
              : (isInCart.quantity || 0) + 1;
        }
      } else {
        cartItemData.quantity = minOrderQuantity
          ? parseFloat(String(minOrderQuantity))
          : packagingQty
            ? parseFloat(String(packagingQty))
            : 1;
      }

      // Validate quantity (show warning but don't block API call)
      const step = packagingQty
        ? parseFloat(String(packagingQty))
        : parseFloat(String(minOrderQuantity || 1));
      const min = minOrderQuantity
        ? parseFloat(String(minOrderQuantity))
        : parseFloat(String(packagingQty || 1));
      const max = 9999999;

      const error = ValidateQuantity(
        step,
        min,
        max,
        cartItemData.quantity || 1
      );

      // Show validation error but don't block the API call
      // Backend will handle validation and return appropriate errors
      if (error) {
        setErrorMessage(error);
        // Don't return early - allow API call to proceed
        // Backend validation will handle the actual enforcement
      } else {
        setErrorMessage(false);
      }

      if (userId && tenantId) {
        // Logged-in user: call API
        try {
          const requestBody: AddToCartRequest["body"] = {
            productsId: productId,
            productId: productId,
            quantity: cartItemData.quantity || 1,
            pos: 0,
            addBundle: true,
            ...(isInCart?.itemNo !== undefined
              ? { itemNo: Number(isInCart.itemNo) }
              : itemNo !== undefined
                ? { itemNo: Number(itemNo) }
                : {}),
            ...(sellerId && {
              sellerId: Number(sellerId),
              sellerName: sellerName || "",
              sellerLocation: sellerLocation || "",
              price: unitListPrice || data.unitListPrice || 0,
            }),
          };

          const response = await CartServices.postCart({
            userId: Number(userId),
            tenantId: String(tenantId),
            useMultiSellerCart: Boolean(sellerId),
            body: requestBody,
            method: isUpdate ? "PUT" : "POST",
          });

          // Parse and update cart with backend response (contains calculated prices, taxes, etc.)
          const updatedCartData = parseCartResponse(response);
          if (updatedCartData.length > 0) {
            setCart(updatedCartData);
          } else {
            // Fallback to refresh if response is empty
            await refreshCart();
          }

          // Clear validation error if API call succeeds
          setErrorMessage(false);
          toast.success("Item added to cart");
        } catch (error) {
          console.error("Error adding to cart:", error);
          // Show backend error message if available
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to add item to cart";
          toast.error(errorMessage);
          setErrorMessage(errorMessage);
        }
      } else {
        // Guest user: update localStorage
        if (isInCart) {
          const updatedCart = cart.map(item => {
            const newQuantity = cartItemData.quantity ?? item.quantity;
            if (
              sellerId &&
              item.productId === isInCart.productId &&
              item.sellerId == sellerId
            ) {
              return { ...item, quantity: newQuantity };
            } else if (!sellerId && item.productId === isInCart.productId) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          });
          cartSetLocalItem(updatedCart);
          setCart(updatedCart);
        } else {
          // Ensure quantity is defined before adding to cart
          const newItem: CartItem = {
            ...cartItemData,
            quantity: cartItemData.quantity ?? 1,
            unitPrice: cartItemData.unitPrice ?? 0,
            totalPrice:
              (cartItemData.quantity ?? 1) * (cartItemData.unitPrice ?? 0),
          } as CartItem;
          const newCart = [newItem, ...cart];
          cartSetLocalItem(newCart);
          setCart(newCart);
        }
        toast.success("Item added to cart");
      }

      setIsCartLoading(false);
      setShowCartCard(true);
    },
    [
      cart,
      userId,
      tenantId,
      getIsInCartItem,
      refreshCart,
      setCart,
      cartSetLocalItem,
      parseCartResponse,
    ]
  );

  /**
   * Change quantity of item in cart
   * Migrated from buyer-fe/src/hooks/useCart.js changeQty
   */
  const changeQty = useCallback(
    async (
      data: ChangeQtyData,
      quantity: number,
      setErrorMessage: (error: string | false) => void
    ) => {
      console.log("🔵 [changeQty] Called with:", {
        productId: data.productId,
        quantity,
        itemNo: data.itemNo,
        sellerId: data.sellerId,
        userId,
        userIdFromContext,
        userIdFromToken,
        tenantId,
        hasUserId: !!userId,
        hasTenantId: !!tenantId,
      });

      setErrorMessage(false);
      const {
        packagingQty,
        minOrderQuantity,
        brandsName,
        productShortDescription,
        productAssetss,
        productId,
        itemNo,
        img,
        sellerId,
        sellerName,
        sellerLocation,
        unitListPrice,
      } = data;

      const isInCart = getIsInCartItem(productId, itemNo, sellerId);

      // Get product image
      const productImage =
        productAssetss && Array.isArray(productAssetss)
          ? (
              find(productAssetss, o => o.isDefault) as
                | { source: string; isDefault?: boolean }
                | undefined
            )?.source ||
            (
              productAssetss[0] as
                | { source: string; isDefault?: boolean }
                | undefined
            )?.source
          : img || "";

      // Prepare cart item data - exclude bundleProducts if it's not the right type
      const { bundleProducts: _, ...dataWithoutBundle } = data;
      const cartItemData: Partial<CartItem> = {
        ...dataWithoutBundle,
        quantity: quantity,
        ...(productImage && { img: productImage }),
        ...(productShortDescription && {
          shortDescription: productShortDescription,
        }),
        ...(brandsName && { brandName: brandsName, brandsName: brandsName }),
      };

      if (sellerId) {
        cartItemData.sellerId = sellerId;
        if (sellerName) {
          cartItemData.sellerName = sellerName;
        }
        if (sellerLocation) {
          cartItemData.sellerLocation = sellerLocation;
        }
      }

      setIsCartLoading(true);

      // Validate quantity (show warning but don't block API call)
      const step = packagingQty
        ? parseFloat(String(packagingQty))
        : parseFloat(String(minOrderQuantity || 1));
      const min = minOrderQuantity
        ? parseFloat(String(minOrderQuantity))
        : parseFloat(String(packagingQty || 1));
      const max = 9999999;

      const error = ValidateQuantity(step, min, max, quantity);

      // Show validation error but don't block the API call
      // Backend will handle validation and return appropriate errors
      if (error) {
        setErrorMessage(error);
        // Don't return early - allow API call to proceed
        // Backend validation will handle the actual enforcement
      } else {
        setErrorMessage(false);
      }

      if (userId && tenantId) {
        // Logged-in user: call API
        console.log("✅ [changeQty] User is logged in, calling API update", {
          userId,
          tenantId,
          productId,
          quantity,
          itemNo: isInCart?.itemNo || itemNo,
        });
        try {
          const requestBody: AddToCartRequest["body"] = {
            productsId: productId,
            productId: productId,
            quantity: quantity,
            pos: 0,
            addBundle: true,
            ...(isInCart?.itemNo !== undefined
              ? { itemNo: Number(isInCart.itemNo) }
              : itemNo !== undefined
                ? { itemNo: Number(itemNo) }
                : {}),
            ...(sellerId && {
              sellerId: Number(sellerId),
              sellerName: sellerName || "",
              sellerLocation: sellerLocation || "",
              price: unitListPrice || data.unitListPrice || 0,
            }),
          };

          console.log("📤 [changeQty] Calling CartServices.postCart with:", {
            userId: Number(userId),
            tenantId: String(tenantId),
            method: "PUT",
            body: requestBody,
          });

          const response = await CartServices.postCart({
            userId: Number(userId),
            tenantId: String(tenantId),
            useMultiSellerCart: Boolean(sellerId),
            body: requestBody,
            method: "PUT",
          });

          console.log(
            "✅ [changeQty] API call successful, response:",
            response
          );

          // Parse and update cart with backend response (contains calculated prices, taxes, etc.)
          // This uses the backend-calculated values instead of making another API call
          const updatedCartData = parseCartResponse(response);
          if (updatedCartData.length > 0) {
            setCart(updatedCartData);
          } else {
            // Fallback to refresh if response is empty
            await refreshCart();
          }

          // Clear validation error if API call succeeds
          setErrorMessage(false);
        } catch (error) {
          console.error("❌ [changeQty] Error updating cart:", error);
          // Show backend error message if available
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update cart";
          toast.error(errorMessage);
          setErrorMessage(errorMessage);
        }
      } else {
        // Guest user: update localStorage
        console.warn(
          "⚠️ [changeQty] Skipping API call - missing userId or tenantId",
          {
            userId,
            tenantId,
            hasUserId: !!userId,
            hasTenantId: !!tenantId,
          }
        );
        if (isInCart) {
          const updatedCart = cart.map(item => {
            if (
              sellerId &&
              item.productId === isInCart.productId &&
              item.sellerId == sellerId
            ) {
              return { ...item, quantity: quantity };
            } else if (!sellerId && item.productId === isInCart.productId) {
              return { ...item, quantity: quantity };
            }
            return item;
          });
          cartSetLocalItem(updatedCart);
          setCart(updatedCart);
        } else {
          // Ensure quantity is defined before adding to cart
          const newItem: CartItem = {
            ...cartItemData,
            quantity: cartItemData.quantity ?? quantity,
            unitPrice: cartItemData.unitPrice ?? 0,
            totalPrice: quantity * (cartItemData.unitPrice ?? 0),
          } as CartItem;
          const newCart = [newItem, ...cart];
          cartSetLocalItem(newCart);
          setCart(newCart);
        }
      }

      setIsCartLoading(false);
      setShowCartCard(true);
    },
    [
      cart,
      userId,
      userIdFromContext,
      userIdFromToken,
      tenantId,
      getIsInCartItem,
      refreshCart,
      setCart,
      cartSetLocalItem,
      parseCartResponse,
    ]
  );

  /**
   * Delete item from cart
   * Migrated from buyer-fe/src/hooks/useCart.js DeleteCart
   */
  const DeleteCart = useCallback(
    async (
      productId: number,
      itemNo: number | string,
      sellerId?: number | string | null
    ) => {
      if (!userId || !tenantId) {
        // Guest user: remove from localStorage
        const newCart = cart.filter(item => {
          if (sellerId) {
            // Multi-seller cart: match by productId and sellerId
            return !(item.productId == productId && item.sellerId == sellerId);
          } else {
            // Legacy behavior: match by productId and itemNo
            return !(item.productId == productId && item.itemNo == itemNo);
          }
        });
        cartSetLocalItem(newCart);
        setCart(newCart);
        toast.success("Item removed from cart");
        return;
      }

      setIsCartLoading(true);
      try {
        const deleteParams: DeleteCartRequest = {
          userId: Number(userId),
          tenantId: String(tenantId),
          productId: productId,
          itemNo: Number(itemNo),
          pos: 0,
        };
        if (sellerId !== undefined && sellerId !== null) {
          deleteParams.sellerId = Number(sellerId);
        }
        await CartServices.deleteCart(deleteParams);

        // Update local state
        const newCart = cart.filter(item => {
          if (sellerId) {
            return !(item.productId == productId && item.sellerId == sellerId);
          } else {
            return !(
              item.productId == productId &&
              (!userId || item.itemNo == itemNo)
            );
          }
        });

        setCart(newCart);
        await refreshCart();
        toast.success("Item removed from cart");
      } catch (error) {
        console.error("Error deleting from cart:", error);
        // Show backend error message if available
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to remove item from cart";
        toast.error(errorMessage);
      } finally {
        setIsCartLoading(false);
        setShowCartCard(false);
      }
    },
    [cart, userId, tenantId, setCart, refreshCart, cartSetLocalItem]
  );

  /**
   * Empty entire cart
   * Migrated from buyer-fe/src/hooks/useCart.js emptyCart
   */
  const emptyCart = useCallback(async () => {
    setIsCartLoading(true);
    try {
      if (userId) {
        await CartServices.emptyCart({ userId: Number(userId) });
        setCart([]);
        await refreshCart();
        toast.success("Cart cleared");
      } else {
        clearGuestCart();
        toast.success("Cart cleared");
      }
    } catch (error) {
      console.error("Error emptying cart:", error);
      toast.error("Failed to clear cart");
    } finally {
      setIsCartLoading(false);
    }
  }, [userId, setCart, refreshCart, clearGuestCart]);

  /**
   * Empty cart by seller
   * Migrated from buyer-fe/src/hooks/useCart.js emptyCartBySeller
   */
  const emptyCartBySeller = useCallback(
    async (sellerId: number | string) => {
      if (!sellerId) {
        console.warn("emptyCartBySeller: sellerId is required");
        return;
      }

      setIsCartLoading(true);
      try {
        if (userId && tenantId) {
          // Logged-in user: call API
          await CartServices.clearCartBySeller({
            userId: Number(userId),
            sellerId: Number(sellerId),
            tenantId: String(tenantId),
          });

          // Remove items from local state
          const updatedCart = cart.filter(item => {
            const itemSellerId =
              item.sellerId || item.vendorId || item.partnerId;
            return String(itemSellerId) !== String(sellerId);
          });

          setCart(updatedCart);
          await refreshCart();
          toast.success("Seller items removed from cart");
        } else {
          // Guest user: filter from localStorage
          const updatedCart = cart.filter(item => {
            const itemSellerId =
              item.sellerId || item.vendorId || item.partnerId;
            return String(itemSellerId) !== String(sellerId);
          });

          cartSetLocalItem(updatedCart);
          setCart(updatedCart);
          toast.success("Seller items removed from cart");
        }
      } catch (error) {
        console.error("Error clearing cart by seller:", error);
        toast.error("Failed to clear seller items from cart");
      } finally {
        setIsCartLoading(false);
      }
    },
    [cart, userId, tenantId, setCart, refreshCart, cartSetLocalItem]
  );

  /**
   * Add multiple items to cart
   * Migrated from buyer-fe/src/hooks/useCart.js addMultipleItems
   */
  const addMultipleItems = useCallback(
    async (
      items: Array<{
        productsId: number;
        productId: number;
        quantity: number;
        addBundle: boolean;
        sellerId?: number;
        sellerName?: string;
        sellerLocation?: string;
        price?: number;
        itemNo?: number;
        pos?: number;
      }>,
      fbtWithCart?: CartItem[]
    ) => {
      setIsCartLoading(true);
      try {
        if (userId && tenantId) {
          // Logged-in user: call API
          const request: AddMultipleItemsRequest = {
            userId: Number(userId),
            tenantId: String(tenantId),
            body: items,
          };

          await CartServices.addMultipleItems(request);
          await refreshCart();
          toast.success("Items added to cart");
        } else {
          // Guest user: update localStorage
          if (fbtWithCart) {
            const res = map(fbtWithCart, prd => {
              const isInCart = getIsInCartItem(prd.productId);
              if (isInCart) {
                return { ...prd, quantity: isInCart.quantity || prd.quantity };
              }
              return prd;
            });
            cartSetLocalItem(res);
            setCart(res);
          } else {
            // Convert items to CartItem format with required fields
            const cartItems: CartItem[] = items.map(item => {
              const cartItem: CartItem = {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.price ?? 0,
                totalPrice: item.quantity * (item.price ?? 0),
              };
              if (item.itemNo !== undefined) {
                cartItem.itemNo = item.itemNo;
              }
              if (item.sellerId !== undefined) {
                cartItem.sellerId = item.sellerId;
              }
              if (item.sellerName !== undefined) {
                cartItem.sellerName = item.sellerName;
              }
              if (item.sellerLocation !== undefined) {
                cartItem.sellerLocation = item.sellerLocation;
              }
              return cartItem;
            });
            cartSetLocalItem([...cartItems, ...cart]);
            setCart([...cartItems, ...cart]);
          }
          toast.success("Items added to cart");
        }
      } catch (error) {
        console.error("Error adding multiple items:", error);
        toast.error("Failed to add items to cart");
      } finally {
        setIsCartLoading(false);
      }
    },
    [
      cart,
      userId,
      tenantId,
      getIsInCartItem,
      refreshCart,
      setCart,
      cartSetLocalItem,
    ]
  );

  return {
    cart,
    cartComment,
    handleCartComment,
    cartAttachments,
    handleUploadCartAttachments,
    addItemToCart,
    changeQty,
    DeleteCart,
    emptyCart,
    emptyCartBySeller,
    addMultipleItems,
    getIsInCart: getIsInCartItem,
    isCartLoading,
    showCartCard,
    setShowCartCard,
    refreshCart,
    syncGuestCart,
    clearGuestCart,
  };
}
