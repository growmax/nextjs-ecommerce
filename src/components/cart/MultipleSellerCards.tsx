"use client";

import PricingFormat from "@/components/PricingFormat";
import CartPriceDetails from "@/components/sales/CartPriceDetails";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart as useCartContext } from "@/contexts/CartContext";
import { useCart } from "@/hooks/useCart/useCart";
import { useCurrentUser } from "@/hooks/useCurrentUser/useCurrentUser";
import useMultipleSellerCart from "@/hooks/useMultipleSellerCart/useMultipleSellerCart";
import type { CartItem } from "@/types/calculation/cart";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CartProceedButton from "@/components/cart/CartProceedButton";
import CartProductCard from "@/components/cart/CartProductCard";

interface MultipleSellerCardsProps {
  onItemUpdate?: (item: CartItem, quantity: number) => void;
  onItemDelete?: (
    productId: number,
    itemNo: string | number,
    sellerId?: string | number
  ) => void;
  isPricingLoading?: boolean;
  handleOrder?: (sellerId: string | number) => void;
  handleQuote?: (sellerId: string | number) => void;
}

export default function MultipleSellerCards({
  onItemUpdate,
  onItemDelete,
  isPricingLoading = false,
  handleOrder,
  handleQuote,
}: MultipleSellerCardsProps) {
  const { cart, isLoading: cartLoading } = useCartContext();
  const { user } = useCurrentUser();
  const { emptyCartBySeller, isCartLoading } = useCart();
  const t = useTranslations("cart");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<
    string | number | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get calculation parameters
  const calculationParams = useMemo(() => {
    return {
      isInter: true,
      insuranceCharges: 0,
      precision: 2,
      Settings: {
        roundingAdjustment: false,
        itemWiseShippingTax: false,
      },
      isSeller: (user as any)?.isSeller || false,
      taxExemption: (user as any)?.taxExemption || false,
    };
  }, [user]);

  // Use multiple seller cart hook
  const {
    sellerCarts,
    hasMultipleSellers,
    sellerIds,
    isPricingLoading: pricingLoadingFromHook,
  } = useMultipleSellerCart(cart, calculationParams);

  // Use prop value if provided, otherwise use hook's loading state
  const isPricingLoadingState = isPricingLoading ?? pricingLoadingFromHook;

  if (cartLoading || isPricingLoadingState) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!sellerCarts || Object.keys(sellerCarts).length === 0) {
    return null;
  }

  const currency = user?.currency;

  // Determine default expanded seller (first seller when multiple sellers exist)
  const defaultSellerId =
    hasMultipleSellers && sellerIds.length > 0
      ? String(sellerIds[0])
      : undefined;

  // Handle delete icon click
  const handleDeleteClick = (
    e: React.MouseEvent,
    sellerId: string | number
  ) => {
    e.stopPropagation(); // Prevent accordion toggle
    setSelectedSellerId(sellerId);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedSellerId) return;

    setIsDeleting(true);
    try {
      await emptyCartBySeller(selectedSellerId);
      setDeleteDialogOpen(false);
      setSelectedSellerId(null);
    } catch (error) {
      console.error("Error deleting seller cart:", error);
      // Error handling is already done in emptyCartBySeller with toast
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open && !isDeleting) {
      setDeleteDialogOpen(false);
      setSelectedSellerId(null);
    }
  };

  return (
    <div>
      {/* Seller Accordion */}
      <Accordion
        type="single"
        collapsible
        {...(defaultSellerId ? { defaultValue: defaultSellerId } : {})}
        className="w-full"
      >
        {sellerIds.map(sellerId => {
          const sellerCart = sellerCarts[sellerId];

          if (!sellerCart) return null;

          const itemCount = sellerCart.itemCount || 0;
          const grandTotal = sellerCart.pricing?.grandTotal || 0;

          return (
            <Card
              key={sellerId}
              className="overflow-hidden transition-all duration-200 mb-6 last:mb-0 border-2 border-gray-200 shadow-sm hover:shadow-md"
            >
              <AccordionItem value={String(sellerId)} className="border-0">
                <AccordionTrigger className="hover:no-underline px-6 py-4 bg-transparent hover:bg-transparent">
                  <div className="flex flex-1 items-center justify-between pr-4">
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-lg">
                          {sellerCart.seller?.name ||
                            `${t("unknownSeller")} ${sellerId}`}
                        </span>
                        {sellerCart.seller?.location &&
                          sellerCart.seller.location !==
                            t("locationNotSpecified") && (
                            <span className="text-sm text-muted-foreground">
                              • {sellerCart.seller.location}
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                          {itemCount} {itemCount === 1 ? t("item") : t("items")}
                        </span>
                        <span className="font-medium text-foreground">
                          {t("total")}:{" "}
                          {currency ? (
                            <PricingFormat
                              buyerCurrency={currency}
                              value={grandTotal}
                            />
                          ) : (
                            `$${grandTotal.toFixed(2)}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => handleDeleteClick(e, sellerId)}
                    className="ml-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-muted shrink-0 translate-y-0.5 flex items-center justify-center"
                    aria-label="Delete seller cart items"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6 pt-2">
                    {/* Left Column: Products List (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                      {sellerCart.items?.map(
                        (item: CartItem, itemIndex: number) => (
                          <CartProductCard
                            key={`${item.productId}-${item.itemNo}-${itemIndex}`}
                            item={item}
                            isPricingLoading={isPricingLoadingState}
                            onUpdate={quantity => {
                              if (onItemUpdate) {
                                onItemUpdate(item, quantity);
                              }
                            }}
                            onDelete={() => {
                              if (onItemDelete) {
                                onItemDelete(
                                  Number(item.productId),
                                  item.itemNo || "",
                                  item.sellerId
                                );
                              }
                            }}
                          />
                        )
                      )}
                    </div>

                    {/* Right Column: Price Details & Buttons (1/3 width) */}
                    <div className="lg:col-span-1">
                      <div className="sticky top-4 space-y-4">
                        {sellerCart.pricing && currency && (
                          <CartPriceDetails
                            cartValue={sellerCart.pricing}
                            currency={currency}
                            isCart={true}
                            isPricingLoading={isPricingLoadingState}
                          />
                        )}

                        <CartProceedButton
                          selectedSellerId={sellerId}
                          disabled={
                            !sellerCart.items || sellerCart.items.length === 0
                          }
                          isLoading={isPricingLoadingState}
                          {...(handleQuote
                            ? { onRequestQuote: () => handleQuote(sellerId) }
                            : {})}
                          {...(handleOrder
                            ? { onPlaceOrder: () => handleOrder(sellerId) }
                            : {})}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          );
        })}
      </Accordion>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="w-full max-w-xs p-4" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Trash2 className="h-4 w-4 text-gray-700" />
              {t("deleteCartItems")}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t("deleteCartItemsConfirmation")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 pt-3 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleDialogClose(false)}
              disabled={isDeleting || isCartLoading}
              className="text-primary hover:text-primary/90 hover:bg-primary/10"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleDeleteConfirm}
              disabled={isDeleting || isCartLoading}
            >
              {isDeleting || isCartLoading ? t("processing") : t("yes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
