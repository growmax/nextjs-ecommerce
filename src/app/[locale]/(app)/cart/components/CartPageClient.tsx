"use client";

import { CartProceedButton, MultipleSellerCards } from "@/components/cart";
import CartProductCard from "@/components/cart/CartProductCard";
import CartPriceDetails from "@/components/sales/CartPriceDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart as useCartContext } from "@/contexts/CartContext";
import useAccessControl from "@/hooks/useAccessControl";
import { useCart } from "@/hooks/useCart";
import useCartPrice from "@/hooks/useCartPrice";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useGetCurrencyModuleSettings from "@/hooks/useGetCurrencyModuleSettings/useGetCurrencyModuleSettings";
import useModuleSettings from "@/hooks/useModuleSettings";
import useSelectedSellerCart from "@/hooks/useSelectedSellerCart";
import { useRouter } from "@/i18n/navigation";
import type { CartItem } from "@/types/calculation/cart";
import { cartCalculation } from "@/utils/calculation/cartCalculation";
import {
  validateCreateOrder,
  validateRequestQuote,
} from "@/utils/cart/cartValidation";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export default function CartPageClient() {
  const { user, loading: userLoading } = useCurrentUser();
  const currency = user?.currency;
  const router = useRouter();
  const t = useTranslations("cart");
  const { cart, cartCount, isLoading: isCartLoading } = useCartContext();
  const {
    changeQty,
    DeleteCart,
    isCartLoading: isCartOperationLoading,
  } = useCart();

  const [_updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [_errorMessages, setErrorMessages] = useState<
    Record<number, string | false>
  >({});

  // Access control
  const { hasQuotePermission, hasOrderPermission } = useAccessControl();
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("selectedSellerId") || null;
      }
      return null;
    }
  );
  //Module settings for minimum values
  const { quoteSettings, orderSettings } = useModuleSettings(
    user ? { userId: user.userId, companyId: user.companyId } : null
  );

  // Currency module settings for minimum values
  const { minimumOrderValue, minimumQuoteValue } = useGetCurrencyModuleSettings(
    user || {},
    quoteSettings?.isMinQuoteValueEnabled ||
      orderSettings?.isMinOrderValueEnabled,
    {}
  );
  // Get selected seller cart for multi-seller support
  // This hook already fetches discount data, applies it, and calculates pricing
  // Use selectedSellerId state to sync with accordion selection
  const {
    hasMultipleSellers,
    selectedSellerId: selectedSeller,
    selectedSellerPricing,
    isPricingLoading: isMultiSellerPricingLoading,
  } = useSelectedSellerCart(cart, selectedSellerId);

 

  // Use useCartPrice for single-seller scenarios to ensure discount calculation is applied
  // This follows the buyer-fe pattern: fetch discounts -> apply to items -> calculate totals
  const handleSellerSelection = (sellerId: string) => {

    setSelectedSellerId(sellerId);
    // Persist to localStorage
    if (typeof window !== "undefined" && sellerId) {
      localStorage.setItem("selectedSellerId", sellerId);
    }
  };
  const {
    cartValue: singleSellerCartValue,
    processedItems: singleSellerProcessedItems,
    isLoading: isSingleSellerPricingLoading,
  } = useCartPrice(cart);

  // Determine which pricing to use:
  // - For multi-seller: use selectedSellerPricing from useSelectedSellerCart
  // - For single-seller: use singleSellerCartValue from useCartPrice (with discount calculation)
  const cartCalculationResult =
    hasMultipleSellers &&
    selectedSellerPricing &&
    Object.keys(selectedSellerPricing).length > 0
      ? selectedSellerPricing
      : singleSellerCartValue
        ? singleSellerCartValue
        : cart.length > 0
          ? cartCalculation(cart, true, 0, 2, {
              roundingAdjustment: false,
              itemWiseShippingTax: false,
            } as any)
          : null;

  // Combine pricing loading states
  const isPricingLoading = hasMultipleSellers
    ? isMultiSellerPricingLoading
    : isSingleSellerPricingLoading;

  // Combine only blocking loading states - don't wait for pricing
  // Pricing loads in background and shows loaders at product/cart level
  const isLoading = userLoading || isCartLoading;

  // Show skeleton loader when any loading state is active
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-6 relative">
                    {/* Product Image Skeleton */}
                    <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

                    {/* Product Info - Center */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <Skeleton className="h-5 w-3/4 mb-1" />
                      {/* Brand Name and Product ID */}
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-32" />
                      </div>
                      {/* Seller (optional) */}
                      <Skeleton className="h-4 w-40 mb-2" />
                      {/* Price Display */}
                      <div className="flex flex-col gap-1 mb-2">
                        <Skeleton className="h-5 w-24" />
                      </div>
                      {/* Quantity, Pack of, and MOQ */}
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>

                    {/* Right Section - Quantity Controls and Delete */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Delete Button */}
                      <Skeleton className="h-8 w-8 rounded-md" />
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-5 w-8" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <div className="sticky top-4 space-y-4">
              <div className="border rounded-lg p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show "log in" message after user loading completes and user is confirmed null
  if (!userLoading && !user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("pleaseLogin")}</h2>
            <p className="text-gray-600">{t("pleaseLoginDescription")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If cart is empty, show empty state
  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("empty")}</h2>
            <p className="text-gray-600 mb-4">{t("emptyDescription")}</p>
            <Button onClick={() => router.push("/products")}>
              {t("continueShopping")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Update quantity handler using useCart hook
  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(Number(item.productId)));

    const setErrorMessage = (error: string | false) => {
      setErrorMessages(prev => ({
        ...prev,
        [Number(item.productId)]: error,
      }));
    };

    try {
      await changeQty(
        {
          productId: Number(item.productId),
          itemNo: item.itemNo,
          quantity: newQuantity,
          packagingQty: item.packagingQuantity || item.packagingQty,
          minOrderQuantity: item.minOrderQuantity,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          sellerLocation: item.sellerLocation,
          unitListPrice: item.unitListPrice,
        } as any,
        newQuantity,
        setErrorMessage
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(Number(item.productId));
        return newSet;
      });
    }
  };

  // Remove item handler using useCart hook
  const removeItem = async (item: CartItem) => {
    setUpdatingItems(prev => new Set(prev).add(Number(item.productId)));

    try {
      await DeleteCart(
        Number(item.productId),
        item.itemNo || "",
        item.sellerId
      );
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(Number(item.productId));
        return newSet;
      });
    }
  };

  // Handle request quote with validation
  const handleQuote = (sellerId?: string | number) => {
    // Get cart items for selected seller or all items
    const cartItems = sellerId
      ? cart.filter(item => String(item.sellerId) === String(sellerId))
      : cart;

    // Get pricing for selected seller or overall
    const pricing =
      sellerId && hasMultipleSellers && selectedSellerPricing
        ? selectedSellerPricing
        : cartCalculationResult;

    // Validate request quote
    const validation = validateRequestQuote({
      cart: cartItems,
      selectedSellerPricing: pricing,
      userId: user?.userId ?? null,
      ...(minimumQuoteValue !== undefined ? { minimumQuoteValue } : {}),
      isMinQuoteValueEnabled: quoteSettings?.isMinQuoteValueEnabled,
      ...(currency
        ? {
            currency: {
              currencyCode: currency.currencyCode,
              symbol: currency.symbol,
            },
          }
        : {}),
      hasAccessPermission: hasQuotePermission,
    });

    if (!validation.isValid) {
      // Show error message
      if (validation.errorMessage) {
        toast.info(validation.errorMessage, {
          duration: 4000,
        });
      }

      // Redirect to login if not authenticated
      if (validation.errorMessage?.includes("login")) {
        router.push(`/auth/login?from=Cart&back=${window.history.length}`);
      }

      return;
    }

    // All validations passed, proceed to quote summary
    const query = sellerId ? `?sellerId=${sellerId}` : "";
    router.push(`/quotesummary${query}`);
  };

  // Handle create order with validation
  const handleOrder = (sellerId?: string | number) => {
    // Get cart items for selected seller or all items
    const cartItems = sellerId
      ? cart.filter(item => String(item.sellerId) === String(sellerId))
      : cart;

    // Get pricing for selected seller or overall
    const pricing =
      sellerId && hasMultipleSellers && selectedSellerPricing
        ? selectedSellerPricing
        : cartCalculationResult;

    // Validate create order
    const validation = validateCreateOrder({
      cart: cartItems,
      selectedSellerPricing: pricing,
      userId: user?.userId ?? null,
      ...(minimumOrderValue !== undefined ? { minimumOrderValue } : {}),
      isMinOrderValueEnabled: orderSettings?.isMinOrderValueEnabled,
      ...(currency
        ? {
            currency: {
              currencyCode: currency.currencyCode,
              symbol: currency.symbol,
            },
          }
        : {}),
      futureStock: false, // TODO: Get from module settings if needed
      hasAccessPermission: hasOrderPermission,
      buyerActive: true, // TODO: Get from buyer selection if seller-fe
    });

    if (!validation.isValid) {
      // Show error message
      if (validation.errorMessage) {
        toast.info(validation.errorMessage, {
          duration: 4000,
        });
      }

      // Redirect to login if not authenticated
      if (validation.errorMessage?.includes("login")) {
        router.push(`/auth/login?from=Cart&back=${window.history.length}`);
      }

      return;
    }

    // All validations passed, proceed to order summary
    const query = sellerId ? `?sellerId=${sellerId}` : "";
    router.push(`/ordersummary${query}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("itemsInCart", { count: cartCount })}
        </p>
      </div>

      <div
        className={
          hasMultipleSellers
            ? "w-full"
            : "grid grid-cols-1 lg:grid-cols-3 gap-6"
        }
      >
        {/* Cart Items */}
        <div className={hasMultipleSellers ? "w-full" : "lg:col-span-2"}>
          {/* Multi-seller cart display */}
          {hasMultipleSellers ? (
            <MultipleSellerCards
              isPricingLoading={isPricingLoading}
              onItemUpdate={async (item, quantity) => {
                await updateQuantity(item, quantity);
              }}
              onItemDelete={async (productId, itemNo, sellerId) => {
                await removeItem(
                  cart.find(
                    i =>
                      Number(i.productId) === productId &&
                      i.itemNo === itemNo &&
                      (sellerId ? i.sellerId == sellerId : true)
                  )!
                );
              }}
              onSellerSelect={handleSellerSelection}
              handleOrder={handleOrder}
              handleQuote={handleQuote}
            />
          ) : (
            /* Single seller or no seller - show all items */
            // Use processed items with discount-calculated prices if available, otherwise use raw cart items
            (singleSellerProcessedItems.length > 0
              ? singleSellerProcessedItems
              : cart
            ).map((item, index) => {
              return (
                <CartProductCard
                  key={`${item.productId}-${item.itemNo}-${item.sellerId || "no-seller"}-${index}`}
                  item={item}
                  isPricingLoading={isPricingLoading}
                  onUpdate={async quantity => {
                    await updateQuantity(item, quantity);
                  }}
                  onDelete={async () => {
                    await removeItem(item);
                  }}
                />
              );
            })
          )}
        </div>

        {/* Order Summary - Only show for single seller */}
        {!hasMultipleSellers && (
          <div>
            <div className="sticky top-4 space-y-4">
              {cartCalculationResult && currency && (
                <CartPriceDetails
                  cartValue={cartCalculationResult}
                  currency={currency}
                  isCart={true}
                  isPricingLoading={isPricingLoading || isCartOperationLoading}
                />
              )}

              <CartProceedButton
                selectedSellerId={selectedSeller}
                disabled={cart.length === 0 || isCartOperationLoading}
                isLoading={isCartOperationLoading}
                onRequestQuote={() => handleQuote(selectedSeller)}
                onPlaceOrder={() => handleOrder(selectedSeller)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
