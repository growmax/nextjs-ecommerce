"use client";

import { useCart as useCartContext } from "@/contexts/CartContext";
import { useTenant } from "@/contexts/TenantContext";
import { useUserId } from "@/contexts/UserDetailsContext";
import { useRouter } from "@/i18n/navigation";
import CartServices, {
    type AddMultipleItemsRequest,
    type AddToCartRequest,
    type DeleteCartRequest,
} from "@/lib/api/CartServices";
import DiscountService from "@/lib/api/services/DiscountService/DiscountService";
import { AuthStorage } from "@/lib/auth";
import {
    batchCacheSellerInfo,
    batchGetSellerInfoFromCache,
    type SellerInfo,
} from "@/lib/cache/sellerInfoCache";
import { JWTService } from "@/lib/services/JWTService";
import { useTenantStore } from "@/store/useTenantStore";
import type { CartItem } from "@/types/calculation/cart";
import { getIsInCart } from "@/utils/cart/cartHelpers";
import { ValidateQuantity } from "@/utils/cart/validateQuantity";
import find from "lodash/find";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

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
  const { tenant } = useTenant();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { tenantData } = useTenantStore();
  const sellerCurrency = tenantData?.sellerCurrency;

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

  // Get tenantCode (string) - API expects tenantCode, not tenantId
  const tenantCode = tenant?.tenantCode || null;
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [showCartCard, setShowCartCard] = useState(false);

  // Helper to check if user is logged in and prompt login if not
  const requireLogin = useCallback((): boolean => {
    if (!userId || !tenantCode) {
      toast.info("Please login to add products to cart");
      router.push("/auth/login");
      return false;
    }
    return true;
  }, [userId, tenantCode, router]);

  /**
   * Batch fetch seller info for multiple products
   * Priority: 1. Cart items, 2. Redis cache, 3. Discount API
   * Used as fallback when discount data is not available (e.g., single product page)
   * @param productIds - Array of product IDs to fetch seller info for
   * @param cartItems - Optional cart items to check first before API calls
   * @returns Map of productId -> {sellerId, sellerName}
   */
  const fetchSellerInfoForProducts = useCallback(
    async (
      productIds: number[],
      cartItems?: CartItem[]
    ): Promise<Map<number, { sellerId: string | number; sellerName: string }>> => {
      const result = new Map<number, { sellerId: string | number; sellerName: string }>();

      if (!userId || !tenantCode || !user?.companyId) {
        return result;
      }

      const companyId = user.companyId;
      const currencyId = user.currency?.id || sellerCurrency?.id || 0;

      if (!currencyId) {
        return result;
      }

      // Step 1: Check cart items first (if provided) - highest priority
      if (cartItems && cartItems.length > 0) {
        productIds.forEach(productId => {
          // Find the product in cart (may have multiple entries with different sellerIds)
          // Use the first match found
          const cartItem = cartItems.find(item => 
            item.productId == productId && 
            (item.sellerId || item.vendorId || item.partnerId)
          );
          
          if (cartItem) {
            const sellerId = cartItem.sellerId || cartItem.vendorId || cartItem.partnerId;
            const sellerName = cartItem.sellerName || cartItem.vendorName || cartItem.partnerName;
            
            if (sellerId && sellerName) {
              result.set(productId, {
                sellerId,
                sellerName,
              });
            }
          }
        });
      }

      // Step 2: Find products that still need seller info (not found in cart)
      const productsNeedingSellerInfo = productIds.filter(
        productId => !result.has(productId)
      );

      if (productsNeedingSellerInfo.length === 0) {
        return result;
      }

      // Step 3: Check Redis cache for remaining products
      const cacheProducts = productsNeedingSellerInfo.map(productId => ({
        productId,
        companyId,
        currencyId,
      }));

      const cachedSellerInfo = await batchGetSellerInfoFromCache(cacheProducts);

      // Add cached results to result map
      cachedSellerInfo.forEach((sellerInfo, productId) => {
        result.set(productId, sellerInfo);
      });

      // Step 4: Find products that are not cached
      const uncachedProductIds = productsNeedingSellerInfo.filter(
        productId => !cachedSellerInfo.has(productId)
      );

      if (uncachedProductIds.length === 0) {
        return result;
      }

      // Step 3: Fetch uncached products from discount API in batch
      try {
        const discountResult = await DiscountService.getDiscount({
          userId,
          tenantId: tenantCode,
          body: {
            Productid: uncachedProductIds,
            CurrencyId: currencyId,
            BaseCurrencyId: sellerCurrency?.id || 0,
            companyId,
            ...(user.currency?.currencyCode || sellerCurrency?.currencyCode
              ? {
                  currencyCode:
                    user.currency?.currencyCode ||
                    sellerCurrency?.currencyCode ||
                    "",
                }
              : {}),
          },
        });

        // Step 4: Process discount response and cache results
        const sellerInfoToCache = new Map<
          number,
          {
            sellerId: string | number;
            sellerName: string;
            companyId: number;
            currencyId: number;
          }
        >();

        discountResult.data?.forEach(discountItem => {
          if (
            discountItem.ProductVariantId &&
            discountItem.sellerId &&
            discountItem.sellerName
          ) {
            const sellerInfo: SellerInfo = {
              sellerId: discountItem.sellerId,
              sellerName: discountItem.sellerName,
            };

            result.set(discountItem.ProductVariantId, sellerInfo);

            // Prepare for caching
            sellerInfoToCache.set(discountItem.ProductVariantId, {
              ...sellerInfo,
              companyId,
              currencyId,
            });
          }
        });

        // Step 5: Cache all fetched seller info in Redis
        if (sellerInfoToCache.size > 0) {
          await batchCacheSellerInfo(sellerInfoToCache);
        }
      } catch (error) {
        console.error("Error fetching seller info from discount API:", error);
        // Don't throw - return partial results
      }

      return result;
    },
    [userId, tenantCode, user, sellerCurrency]
  );

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

    // Process seller information
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

      // Prepare cart item data
      const cartItemData: Partial<CartItem> = {
        ...data,
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

      // Require login before proceeding
      if (!requireLogin()) {
        setIsCartLoading(false);
        return;
      }

      // Fetch seller info if not provided
      let finalSellerId = sellerId;
      let finalSellerName = sellerName;
      let finalSellerLocation = sellerLocation;
      let finalUnitListPrice = unitListPrice || data.unitListPrice;

      // Optimize: Use seller info from cart if product is already in cart
      if (!finalSellerId && isInCart) {
        const cartSellerId = isInCart.sellerId || isInCart.vendorId || isInCart.partnerId;
        const cartSellerName = isInCart.sellerName || isInCart.vendorName || isInCart.partnerName;
        const cartSellerLocation = isInCart.sellerLocation || isInCart.vendorLocation;
        
        if (cartSellerId && cartSellerName) {
          finalSellerId = cartSellerId;
          finalSellerName = cartSellerName;
          if (cartSellerLocation) {
            finalSellerLocation = cartSellerLocation;
          }
          if (isInCart.unitListPrice !== undefined) {
            finalUnitListPrice = isInCart.unitListPrice;
          }
        }
      }

      // Only fetch from API if seller info is still missing
      if (!finalSellerId && userId && tenantCode && user?.companyId) {
        try {
          // Pass cart items to optimize - will check cart first before API calls
          const sellerInfoMap = await fetchSellerInfoForProducts([productId], cart);
          const sellerInfo = sellerInfoMap.get(productId);
          if (sellerInfo) {
            finalSellerId = sellerInfo.sellerId;
            finalSellerName = sellerInfo.sellerName;
          }
        } catch (error) {
          console.error("Error fetching seller info:", error);
          // Continue without seller info if fetch fails
        }
      }

      // Logged-in user: call API
      try {
        const requestBody: AddToCartRequest["body"] = {
          productsId: productId,
          productId: productId,
          quantity: cartItemData.quantity || 1,
          pos: 0,
          ...(isInCart?.itemNo !== undefined
            ? { itemNo: Number(isInCart.itemNo) }
            : itemNo !== undefined
              ? { itemNo: Number(itemNo) }
              : {}),
          ...(finalSellerId && {
            sellerId: Number(finalSellerId),
            sellerName: finalSellerName || "",
            sellerLocation: finalSellerLocation || "",
            price: finalUnitListPrice || 0,
          }),
        };

        // Ensure CartServices is properly initialized
        // Try to reinitialize if needed (handles page refresh scenarios)
        if (!CartServices || typeof CartServices.postCart !== "function") {
          console.warn("⚠️ [addItemToCart] CartServices not initialized, attempting to reinitialize...");
          // Force module reload by re-importing
          try {
            const CartServicesModule = await import("@/lib/api/CartServices");
            const FreshCartServices = CartServicesModule.default;
            if (FreshCartServices && typeof FreshCartServices.postCart === "function") {
              // Use the fresh instance
              const response = await FreshCartServices.postCart({
                userId: Number(userId),
                tenantId: String(tenantCode),
                useMultiSellerCart: Boolean(finalSellerId),
                body: requestBody,
                method: isUpdate ? "PUT" : "POST",
              });
              
              const updatedCartData = parseCartResponse(response);
              if (updatedCartData.length > 0) {
                setCart(updatedCartData);
              } else {
                await refreshCart();
              }
              setErrorMessage(false);
              setIsCartLoading(false);
              return;
            }
          } catch (reinitError) {
            console.error("❌ [addItemToCart] Failed to reinitialize CartServices:", reinitError);
          }
          throw new Error("Cart service is not available. Please refresh the page.");
        }

        const response = await CartServices.postCart({
          userId: Number(userId),
          tenantId: String(tenantCode),
          useMultiSellerCart: Boolean(finalSellerId),
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

      setIsCartLoading(false);
      setShowCartCard(true);
    },
    [
      cart,
      getIsInCartItem,
      refreshCart,
      setCart,
      parseCartResponse,
      requireLogin,
      userId,
      tenantCode,
      user,
      fetchSellerInfoForProducts,
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

      // Prepare cart item data
      const cartItemData: Partial<CartItem> = {
        ...data,
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

      // Require login before proceeding
      if (!requireLogin()) {
        setIsCartLoading(false);
        return;
      }

      // Logged-in user: call API
      try {
        const requestBody: AddToCartRequest["body"] = {
          productsId: productId,
          productId: productId,
          quantity: quantity,
          pos: 0,
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

        // Ensure CartServices is properly initialized
        // Try to reinitialize if needed (handles page refresh scenarios)
        if (!CartServices || typeof CartServices.postCart !== "function") {
          console.warn("⚠️ [changeQty] CartServices not initialized, attempting to reinitialize...");
          // Force module reload by re-importing
          try {
            // Clear the module cache and re-import
            const CartServicesModule = await import("@/lib/api/CartServices");
            const FreshCartServices = CartServicesModule.default;
            if (FreshCartServices && typeof FreshCartServices.postCart === "function") {
              // Use the fresh instance
              const response = await FreshCartServices.postCart({
                userId: Number(userId),
                tenantId: String(tenantCode),
                useMultiSellerCart: Boolean(sellerId),
                body: requestBody,
                method: "PUT",
              });
              
              const updatedCartData = parseCartResponse(response);
              if (updatedCartData.length > 0) {
                setCart(updatedCartData);
              } else {
                await refreshCart();
              }
              setErrorMessage(false);
              setIsCartLoading(false);
              return;
            }
          } catch (reinitError) {
            console.error("❌ [changeQty] Failed to reinitialize CartServices:", reinitError);
          }
          throw new Error("Cart service is not available. Please refresh the page.");
        }

        const response = await CartServices.postCart({
          userId: Number(userId),
          tenantId: String(tenantCode),
          useMultiSellerCart: Boolean(sellerId),
          body: requestBody,
          method: "PUT",
        });

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

      setIsCartLoading(false);
      setShowCartCard(true);
    },
    [
      getIsInCartItem,
      refreshCart,
      setCart,
      parseCartResponse,
      requireLogin,
      userId,
      tenantCode,
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
      // Require login before proceeding
      if (!requireLogin()) {
        return;
      }

      setIsCartLoading(true);
      try {
        const deleteParams: DeleteCartRequest = {
          userId: Number(userId),
          tenantId: String(tenantCode),
          productId: productId,
          itemNo: Number(itemNo),
          pos: 0,
        };
        if (sellerId !== undefined && sellerId !== null) {
          deleteParams.sellerId = Number(sellerId);
        }
        await CartServices.deleteCart(deleteParams);

        // Update local state optimistically for instant UI update
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
        // Set loading to false immediately after local state update for instant UI
        setIsCartLoading(false);
        setShowCartCard(false);
        toast.success("Item removed from cart");

        // Refresh cart in background without blocking UI
        // Don't await - let it happen in the background
        refreshCart().catch(error => {
          console.error("Error refreshing cart after delete:", error);
          // Don't show error to user - delete already succeeded
        });
      } catch (error) {
        console.error("Error deleting from cart:", error);
        // Show backend error message if available
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to remove item from cart";
        toast.error(errorMessage);
        setIsCartLoading(false);
        setShowCartCard(false);
      }
    },
    [cart, userId, tenantCode, setCart, refreshCart, requireLogin]
  );

  /**
   * Empty entire cart
   * Migrated from buyer-fe/src/hooks/useCart.js emptyCart
   */
  const emptyCart = useCallback(async () => {
    // Require login before proceeding
    if (!requireLogin()) {
      return;
    }

    setIsCartLoading(true);
    try {
      await CartServices.emptyCart({ userId: Number(userId!) });
      setCart([]);
      await refreshCart();
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error emptying cart:", error);
      toast.error("Failed to clear cart");
    } finally {
      setIsCartLoading(false);
    }
  }, [userId, setCart, refreshCart, requireLogin]);

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

      // Require login before proceeding
      if (!requireLogin()) {
        return;
      }

      setIsCartLoading(true);
      try {
        await CartServices.clearCartBySeller({
          userId: Number(userId!),
          sellerId: Number(sellerId),
          tenantId: String(tenantCode!),
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
      } catch (error) {
        console.error("Error clearing cart by seller:", error);
        toast.error("Failed to clear seller items from cart");
      } finally {
        setIsCartLoading(false);
      }
    },
    [cart, userId, tenantCode, setCart, refreshCart, requireLogin]
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
        sellerId?: number;
        sellerName?: string;
        sellerLocation?: string;
        price?: number;
        itemNo?: number;
        pos?: number;
      }>
    ) => {
      // Require login before proceeding
      if (!requireLogin()) {
        return;
      }

      setIsCartLoading(true);
      try {
        // Fetch seller info for products that don't have it
        const productIdsNeedingSellerInfo = items
          .filter(item => !item.sellerId)
          .map(item => item.productId);

        let sellerInfoMap = new Map<
          number,
          { sellerId: string | number; sellerName: string }
        >();

        // Optimize: Check cart first, then fetch from API if needed
        if (productIdsNeedingSellerInfo.length > 0) {
          sellerInfoMap = await fetchSellerInfoForProducts(
            productIdsNeedingSellerInfo,
            cart // Pass cart items to check first before API calls
          );
        }

        // Merge seller info into items
        const itemsWithSellerInfo = items.map(item => {
          if (!item.sellerId && sellerInfoMap.has(item.productId)) {
            const sellerInfo = sellerInfoMap.get(item.productId)!;
            return {
              ...item,
              sellerId: Number(sellerInfo.sellerId),
              sellerName: sellerInfo.sellerName,
            };
          }
          return item;
        });

        const request: AddMultipleItemsRequest = {
          userId: Number(userId!),
          tenantId: String(tenantCode!),
          body: itemsWithSellerInfo,
        };

        await CartServices.addMultipleItems(request);
        await refreshCart();
        toast.success("Items added to cart");
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
      tenantCode,
      refreshCart,
      requireLogin,
      fetchSellerInfoForProducts,
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
