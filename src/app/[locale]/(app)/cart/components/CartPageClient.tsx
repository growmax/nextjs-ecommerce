"use client";

import { useCart } from "@/contexts/CartContext";
import { useTenantInfo } from "@/contexts/TenantContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useSelectedSellerCart from "@/hooks/useSelectedSellerCart";
import CartServices from "@/lib/api/CartServices";
import { some } from "lodash";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import SellerCard from "./SellerCard/SellerCard";

interface CartItem {
  productId: number;
  quantity: number;
  replacement?: boolean;
  showPrice?: boolean;
  inventoryResponse?: {
    inStock: boolean;
  };
  itemNo: string;
  sellerId?: string | number;
  sellerName?: string;
  sellerLocation?: string;
  productName?: string;
  shortDescription?: string;
  brandName?: string;
  unitPrice?: number;
  unitListPrice?: number;
  discount?: number;
  discountPercentage?: number;
  _updated?: number;
  [key: string]: unknown;
}

export default function CartPageClient() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const tenantInfo = useTenantInfo();
  const currency = user?.currency;
  const userId = user?.userId;
  const tenantId = tenantInfo?.tenantCode || "";

  // Use cart context
  const {
    cart,
    cartCount,
    setCart,
    updateCartCount,
    refreshCart,
    isLoading: isCartLoading,
  } = useCart();

  // Commented out - address check disabled
  const billingDatas: unknown[] = [];
  const SelectedShippingAddressData: unknown = null;
  // const { billingDatas } = useBilling(user);
  // const { SelectedShippingAddressData } = useCurrentShippingAddress(user);

  // Initialize selectedSellerId from localStorage if available
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("selectedSellerId") || null;
      }
      return null;
    }
  );

  const {
    selectedSellerCart,
    selectedSellerItems,
    selectedSellerPricing,
    hasMultipleSellers,
    isPricingLoading,
    sellerCarts,
    sellerIds,
  } = useSelectedSellerCart(cart, selectedSellerId);

  // Handle seller selection
  const handleSellerSelection = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    // Persist to localStorage
    if (typeof window !== "undefined" && sellerId) {
      localStorage.setItem("selectedSellerId", sellerId);
    }
  };

  // Address validation check
  const addressCheck = (_isOrder: boolean): boolean => {
    // TODO: Add address validation when billingDatas and SelectedShippingAddressData are properly defined
    return true;
  };

  // Handle Order submission
  const handleOrder = () => {
    if (selectedSellerPricing?.hasProductsWithNegativeTotalPrice) {
      toast.error(
        "Cart contains products with negative prices. Please review your cart."
      );
      return;
    }

    if (userId) {
      if (some(cart, (item: CartItem) => item.replacement)) {
        toast.info("Few products are unavailable, try replacing items");
        return;
      }

      if (
        !some(cart, ["showPrice", false]) &&
        selectedSellerPricing?.hasAllProductsAvailableInPriceList
      ) {
        if (some(cart, ["inventoryResponse.inStock", false])) {
          toast.info("Remove out of stock product(s) to place order");
        } else {
          const addressPasses = addressCheck(true);
          if (addressPasses) {
            router.push(
              selectedSellerId
                ? `/ordersummary?sellerId=${selectedSellerId}`
                : "/ordersummary"
            );
          }
        }
      } else {
        toast.info(
          "Cart contains product(s) with price(s) unknown, ask for quote instead"
        );
        return;
      }
    } else {
      router.push(`/auth/login?from=Cart`);
    }
  };

  // Handle Quote submission
  const handleQuote = () => {
    if (selectedSellerPricing?.hasProductsWithNegativeTotalPrice) {
      toast.error(
        "Cart contains products with negative prices. Please review your cart."
      );
      return;
    }

    if (userId) {
      if (some(cart, (item: CartItem) => item.replacement)) {
        toast.info("Few products are unavailable, try replacing items");
        return;
      }

      const addressPasses = addressCheck(false);
      if (addressPasses) {
        router.push(
          selectedSellerId
            ? `/quotesummary?sellerId=${selectedSellerId}`
            : "/quotesummary"
        );
      }
    } else {
      router.push(`/auth/login?from=Cart`);
    }
  };

  // Change quantity in cart - Following reference pattern from useCart.js
  const changeQty = async (item: CartItem, newQuantity: number) => {
    if (!userId || newQuantity <= 0) return;

    try {
      // Add timestamp to trigger pricing refetch
      const timestamp = Date.now();

      // Update cart locally first for better UX (following reference pattern)
      const updatedCart = cart.map(cartItem => {
        if (item.sellerId) {
          // Multi-seller cart: match by productId and sellerId
          if (
            cartItem.productId === item.productId &&
            String(cartItem.sellerId) === String(item.sellerId)
          ) {
            return { ...cartItem, quantity: newQuantity, _updated: timestamp };
          }
        } else {
          // Single seller: match by productId only
          if (cartItem.productId === item.productId) {
            return { ...cartItem, quantity: newQuantity, _updated: timestamp };
          }
        }
        return cartItem;
      });

      setCart(updatedCart);

      // Call postCart API with PUT method (following reference useCart.js line 344)
      await CartServices.postCart({
        userId: Number(userId),
        tenantId,
        useMultiSellerCart: true,
        body: {
          productsId: item.productId,
          productId: item.productId,
          quantity: newQuantity,
          itemNo: item.itemNo ? Number(item.itemNo) : 0,
          pos: 0,
          addBundle: true,
          sellerId: item.sellerId ? Number(item.sellerId) : 0,
          sellerName: item.sellerName || "",
          sellerLocation: item.sellerLocation || "",
          price: item.unitListPrice || item.unitPrice || 0,
        },
      });

      // The pricing hooks will automatically refetch due to _updated timestamp change
      toast.success("Quantity updated successfully");
    } catch (_error) {
      toast.error("Failed to update quantity");
      // Revert on error
      await refreshCart();
    }
  };

  // Delete item from cart
  const deleteCart = async (
    productId: number,
    _itemNo: string,
    _sellerId?: string | number
  ) => {
    if (!userId) return;

    try {
      // Update cart locally first (filter by productId and sellerId for multi-seller support)
      const updatedCart = cart.filter(item => {
        if (_sellerId) {
          return !(
            item.productId === productId &&
            String(item.sellerId) === String(_sellerId)
          );
        }
        return item.productId !== productId;
      });
      setCart(updatedCart);
      updateCartCount(updatedCart.length);

      // Call API to delete item from server (following reference pattern with DELETE method)
      await CartServices.deleteCart({
        userId: Number(userId),
        tenantId,
        productId,
        itemNo: Number(_itemNo),
        sellerId: Number(_sellerId || 0),
        pos: 0,
      });

      toast.success("Item removed from cart");
    } catch (_error) {
      toast.error("Failed to remove item");
      // Revert on error
      await refreshCart();
    }
  };

  // Empty entire cart
  const emptyCart = async () => {
    if (!userId) return;

    try {
      await CartServices.emptyCart({ userId });
      setCart([]);
      updateCartCount(0);
      toast.success("Cart cleared successfully");
      // Refresh cart to ensure UI is in sync with backend
      await refreshCart();
    } catch (_error) {
      toast.error("Failed to clear cart");
    }
  };

  // Handle adding product from search
  const handleAddProduct = async (product: unknown) => {
    if (!userId) {
      toast.info("Please login to add products to cart");
      return;
    }

    try {
      const prod = product as {
        productId: number;
        brandProductId?: string;
        productName?: string;
      };

      // Add product to cart via API
      await CartServices.postCart({
        userId: Number(userId),
        tenantId,
        useMultiSellerCart: true,
        body: {
          productsId: prod.productId,
          productId: prod.productId,
          quantity: 1,
          itemNo: 0,
          pos: 0,
          addBundle: true,
          sellerId: 0,
          sellerName: "",
          sellerLocation: "",
          price: 0,
        },
      });

      toast.success(
        `${prod.brandProductId || prod.productName || "Product"} added to cart`
      );

      // Refresh cart to show the newly added item
      await refreshCart();
    } catch (_error) {
      toast.error("Failed to add product to cart");
    }
  };

  return (
    <>
      <SellerCard
        totalCart={cartCount}
        cart={cart}
        // @ts-expect-error - user type mismatch with SellerCard expectations
        user={user}
        selectedSellerId={selectedSellerId}
        onSellerSelect={handleSellerSelection}
        selectedSellerPricing={selectedSellerPricing}
        selectedSellerCart={selectedSellerCart}
        selectedSellerItems={selectedSellerItems}
        hasMultipleSellers={hasMultipleSellers}
        isPricingLoading={isPricingLoading}
        isLoading={isCartLoading}
        // @ts-expect-error - item type mismatch with SellerCard expectations
        onItemUpdate={changeQty}
        onItemDelete={deleteCart}
        onClearCart={emptyCart}
        handleOrder={handleOrder}
        handleQuote={handleQuote}
        currency={currency}
        sellerCarts={sellerCarts}
        sellerIds={sellerIds}
        onAddProduct={handleAddProduct}
      />
    </>
  );
}
