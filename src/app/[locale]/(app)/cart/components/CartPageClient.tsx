"use client";

import useBilling from "@/hooks/useBilling";
import useCurrentShippingAddress from "@/hooks/useCurrentShippingAddress";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useGetCurrencyModuleSettings from "@/hooks/useGetCurrencyModuleSettings";
import useModuleSettings from "@/hooks/useModuleSettings";
import useSelectedSellerCart from "@/hooks/useSelectedSellerCart";
import CartServices from "@/lib/api/CartServices";
import { useEffect, useState } from "react";
import SellerCard from "./SellerCard/SellerCard";
import { useRouter } from "next/navigation";
import { isEmpty, some } from "lodash";
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

export default function CartPageClient() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const currency = user?.currency;
  const userId = user?.userId;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalCart, setTotalCart] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { billingDatas } = useBilling(user);
  const { SelectedShippingAddressData } = useCurrentShippingAddress(user);

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

  const { orderSettings, quoteSettings } = useModuleSettings(user);
  const { isMinOrderValueEnabled } = orderSettings || {};
  const { isMinQuoteValueEnabled } = quoteSettings || {};

  const { minimumOrderValue, minimumQuoteValue } = useGetCurrencyModuleSettings(
    user || {},
    isMinOrderValueEnabled || isMinQuoteValueEnabled,
    currency || {}
  );

  const getCart = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const res: { data?: CartItem[] } = await CartServices.getCart(userId);
      if (res?.data) {
        setCart(res.data);
        setTotalCart(res.data.length);
      }
    } catch (_error) {
      toast.error("Failed to fetch cart");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Handle seller selection
  const handleSellerSelection = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    // Persist to localStorage
    if (typeof window !== "undefined" && sellerId) {
      localStorage.setItem("selectedSellerId", sellerId);
    }
  };

  // Address validation check
  const addressCheck = (isOrder: boolean): boolean => {
    if (!user?.isRegistered) {
      toast.info("Please Create Address To Proceed.");
      const redirectPath = isOrder ? "ordersummary" : "quotesummary";
      router.push(`/address?addressId=newUser&redirect=${redirectPath}`);
      return false;
    } else {
      if (billingDatas?.length === 0 || isEmpty(SelectedShippingAddressData)) {
        toast.info("Billing or shipping address might not be available");
        const redirectPath = isOrder ? "ordersummary" : "quotesummary";
        router.push(`/address?addressId=newUser&redirect=${redirectPath}`);
        return false;
      } else {
        return true;
      }
    }
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
            if (isMinOrderValueEnabled) {
              if (
                minimumOrderValue &&
                minimumOrderValue > selectedSellerPricing?.grandTotal
              ) {
                toast.info(
                  `Minimum order value ${currency?.currencyCode} ${minimumOrderValue}`
                );
                return;
              } else {
                router.push(
                  selectedSellerId
                    ? `/ordersummary?sellerId=${selectedSellerId}`
                    : "/ordersummary"
                );
              }
            } else {
              router.push(
                selectedSellerId
                  ? `/ordersummary?sellerId=${selectedSellerId}`
                  : "/ordersummary"
              );
            }
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
        if (isMinQuoteValueEnabled) {
          if (
            minimumQuoteValue &&
            minimumQuoteValue > selectedSellerPricing?.grandTotal
          ) {
            toast.info(
              `Minimum Quote value ${currency?.currencyCode} ${minimumQuoteValue}`
            );
            return;
          } else {
            router.push(
              selectedSellerId
                ? `/quotesummary?sellerId=${selectedSellerId}`
                : "/quotesummary"
            );
          }
        } else {
          router.push(
            selectedSellerId
              ? `/quotesummary?sellerId=${selectedSellerId}`
              : "/quotesummary"
          );
        }
      }
    } else {
      router.push(`/auth/login?from=Cart`);
    }
  };

  // Change quantity in cart
  const changeQty = async (item: CartItem, newQuantity: number) => {
    if (!userId || newQuantity <= 0) return;

    try {
      setIsLoading(true);
      // Update cart locally first for better UX
      const updatedCart = cart.map(cartItem =>
        cartItem.productId === item.productId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      setCart(updatedCart);

      // TODO: Add API call to update quantity on server
      toast.success("Quantity updated successfully");
    } catch (_error) {
      toast.error("Failed to update quantity");
      // Revert on error
      await getCart();
    } finally {
      setIsLoading(false);
    }
  };

  // Delete item from cart
  const deleteCart = async (
    productId: number,
    _itemNo: string,
    _sellerId?: string
  ) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      // Update cart locally first
      const updatedCart = cart.filter(item => item.productId !== productId);
      setCart(updatedCart);
      setTotalCart(updatedCart.length);

      // TODO: Add API call to delete item from server
      toast.success("Item removed from cart");
    } catch (_error) {
      toast.error("Failed to remove item");
      // Revert on error
      await getCart();
    } finally {
      setIsLoading(false);
    }
  };

  // Empty entire cart
  const emptyCart = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      await CartServices.deleteCart({ userId, pos: 0 });
      setCart([]);
      setTotalCart(0);
      toast.success("Cart cleared successfully");
    } catch (_error) {
      toast.error("Failed to clear cart");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <SellerCard
        totalCart={totalCart}
        cart={cart}
        selectedSellerId={selectedSellerId}
        onSellerSelect={handleSellerSelection}
        selectedSellerPricing={selectedSellerPricing}
        selectedSellerCart={selectedSellerCart}
        selectedSellerItems={selectedSellerItems}
        hasMultipleSellers={hasMultipleSellers}
        isPricingLoading={isPricingLoading}
        isLoading={isLoading}
        onItemUpdate={changeQty}
        onItemDelete={deleteCart}
        onClearCart={emptyCart}
        handleOrder={handleOrder}
        handleQuote={handleQuote}
        minimumOrderValue={
          typeof minimumOrderValue === "string"
            ? parseFloat(minimumOrderValue)
            : minimumOrderValue
        }
        minimumQuoteValue={
          typeof minimumQuoteValue === "string"
            ? parseFloat(minimumQuoteValue)
            : minimumQuoteValue
        }
        currency={currency}
        sellerCarts={sellerCarts}
        sellerIds={sellerIds}
      />
    </>
  );
}
