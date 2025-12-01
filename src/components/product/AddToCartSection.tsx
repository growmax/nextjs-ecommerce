"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePathname } from "@/i18n/navigation";
import { DiscountItem } from "@/lib/api/services/DiscountService/DiscountService";
import { batchCacheSellerInfo } from "@/lib/cache/sellerInfoCache";
import { cn } from "@/lib/utils";
import { useTenantStore } from "@/store/useTenantStore";
import { getIsInCart } from "@/utils/cart/cartHelpers";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export interface AddToCartSectionProps {
  productId: number;
  productTitle: string;
  isAvailable: boolean;
  compact?: boolean;
  className?: string;
  // Optional product data fields
  packagingQty?: number;
  minOrderQuantity?: number;
  sellerId?: number | string;
  sellerName?: string;
  sellerLocation?: string;
  unitListPrice?: number;
  itemNo?: number | string;
  productAssetss?: Array<{
    source: string;
    isDefault?: boolean;
  }>;
  brandsName?: string;
  productShortDescription?: string;
  img?: string;
  // Discount data props (from batched fetch)
  discountData?: DiscountItem[];
  discountLoading?: boolean;
  discountError?: Error | null;
}

export default function AddToCartSection({
  productId,
  isAvailable,
  compact = false,
  className,
  packagingQty = 1,
  minOrderQuantity = 1,
  sellerId,
  sellerName,
  sellerLocation,
  unitListPrice,
  itemNo,
  productAssetss,
  brandsName,
  productShortDescription,
  img,
  discountData,
  discountLoading = false,
  discountError: _discountError,
}: AddToCartSectionProps) {
  const [errorMessage, setErrorMessage] = useState<string | false>(false);
  const { cart, addItemToCart, DeleteCart, isCartLoading } = useCart();
  const { user } = useCurrentUser();
  const { tenantData } = useTenantStore();

  // Extract seller info from batched discount data
  const productDiscount = useMemo(() => {
    return discountData?.find(
      item => item.ProductVariantId === productId
    );
  }, [discountData, productId]);

  // Use provided seller info or extract from discount data
  const finalSellerId = sellerId || productDiscount?.sellerId;
  const finalSellerName = sellerName || productDiscount?.sellerName;
  const finalPrice = unitListPrice || productDiscount?.BasePrice;

  // Combined loading state: cart loading OR discount fetching
  const isButtonLoading = isCartLoading || discountLoading;

  // Cache seller info in Redis after extracting from discount data
  useEffect(() => {
    if (
      productDiscount &&
      productDiscount.sellerId &&
      productDiscount.sellerName &&
      user?.companyId
    ) {
      const currencyId =
        user.currency?.id || tenantData?.sellerCurrency?.id || 0;
      if (currencyId) {
        batchCacheSellerInfo(
          new Map([
            [
              productId,
              {
                sellerId: productDiscount.sellerId,
                sellerName: productDiscount.sellerName,
                companyId: user.companyId,
                currencyId,
              },
            ],
          ])
        ).catch(error => {
          console.warn("Failed to cache seller info:", error);
        });
      }
    }
  }, [
    productDiscount,
    productId,
    user?.companyId,
    user?.currency?.id,
    tenantData?.sellerCurrency?.id,
  ]);

  // Check if product is in cart (optimized with useMemo)
  const isInCart = useMemo(() => {
    return getIsInCart(cart, productId, itemNo, finalSellerId);
  }, [cart, productId, itemNo, finalSellerId]);

  // Get current quantity from cart or use default
  const currentQuantity = useMemo(() => {
    if (isInCart?.quantity) {
      return isInCart.quantity;
    }
    return minOrderQuantity || packagingQty || 1;
  }, [isInCart, minOrderQuantity, packagingQty]);

  // Calculate minimum quantity for this product
  const productMinQty = useMemo(() => {
    return minOrderQuantity || packagingQty || 1;
  }, [minOrderQuantity, packagingQty]);

  // Calculate quantity step
  const quantityStep = useMemo(() => {
    return packagingQty || minOrderQuantity || 1;
  }, [packagingQty, minOrderQuantity]);

  // Get itemNo from cart item if available
  const currentItemNo = useMemo(() => {
    return isInCart?.itemNo || itemNo || 0;
  }, [isInCart, itemNo]);

  // Prepare product data for cart operations (only include defined fields)
  const productData = useMemo(() => {
    const data: {
      productId: number;
      itemNo: number | string;
      packagingQty: number;
      minOrderQuantity: number;
      brandsName?: string;
      productShortDescription?: string;
      productAssetss?: Array<{ source: string; isDefault?: boolean }>;
      img?: string;
      sellerId?: number | string;
      sellerName?: string;
      sellerLocation?: string;
      unitListPrice?: number;
    } = {
      productId,
      itemNo: currentItemNo,
      packagingQty,
      minOrderQuantity,
    };

    if (brandsName) data.brandsName = brandsName;
    if (productShortDescription) data.productShortDescription = productShortDescription;
    if (productAssetss) data.productAssetss = productAssetss;
    if (img) data.img = img;
    if (finalSellerId) data.sellerId = finalSellerId;
    if (finalSellerName) data.sellerName = finalSellerName;
    if (sellerLocation) data.sellerLocation = sellerLocation;
    if (finalPrice !== undefined && finalPrice !== null) data.unitListPrice = finalPrice;

    return data;
  }, [
    productId,
    currentItemNo,
    packagingQty,
    minOrderQuantity,
    brandsName,
    productShortDescription,
    productAssetss,
    img,
    finalSellerId,
    finalSellerName,
    sellerLocation,
    finalPrice,
  ]);

  // Validation helper
  const validateBeforeAdd = (): "ok" | "unavailable" => {
    if (!isAvailable) return "unavailable";
    return "ok";
  };

  // Handle initial add to cart
  // Note: useCart hook handles guest users via localStorage, so we don't need to check login here
  const handleAddToCart = async () => {
    const validation = validateBeforeAdd();
    if (validation === "unavailable") {
      setErrorMessage("This product is currently unavailable");
      return;
    }
    console.log(productData, productMinQty)

    await addItemToCart(
      {
        ...productData,
        quantity: productMinQty,
      },
      setErrorMessage,
      false,
      false
    );
  };

  // Handle increment quantity
  const handleIncrement = async () => {
    if (!isInCart) {
      // If not in cart, add with incremented quantity
      await addItemToCart(
        {
          ...productData,
          quantity: productMinQty,
        },
        setErrorMessage,
        false,
        false
      );
      return;
    }

    // Calculate new quantity
    const newQuantity = currentQuantity + quantityStep;
    await addItemToCart(
      {
        ...productData,
        quantity: newQuantity,
      },
      setErrorMessage,
      false,
      true // isUpdate
    );
  };

  // Handle decrement quantity
  const handleDecrement = async () => {
    if (!isInCart) return;

    const newQuantity = Math.max(productMinQty, currentQuantity - quantityStep);

    // If quantity reaches minimum, remove from cart
    if (newQuantity <= productMinQty && currentQuantity <= productMinQty) {
      await handleRemoveFromCart();
      return;
    }

    await addItemToCart(
      {
        ...productData,
        quantity: newQuantity,
      },
      setErrorMessage,
      true, // decrease
      true // isUpdate
    );
  };

  // Handle remove from cart
  const handleRemoveFromCart = async () => {
    if (!isInCart) return;

    await DeleteCart(
      productId,
      currentItemNo,
      finalSellerId || undefined
    );
  };
  const pathname = usePathname();
  const isProductPage = pathname?.startsWith("/products/");

  // Show quantity controls if item is in cart
  const showQuantityControls = !!isInCart;

  return (
    <div className={cn("space-y-2", isProductPage && "hidden lg:block", className)}>
      {!showQuantityControls ? (
        <Button
          size={compact ? "sm" : "lg"}
          className={cn(
            "w-full font-semibold",
            compact
              ? "h-8 text-[10px]"
              : "h-9 text-xs"
          )}
          onClick={handleAddToCart}
          disabled={!isAvailable || isButtonLoading}
        >
          {isButtonLoading ? (
            <Loader2 className={cn("mr-2 animate-spin", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
          ) : (
            <ShoppingCart className={cn("mr-2", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
          )}
          {isButtonLoading
            ? discountLoading
              ? "LOADING..."
              : "ADDING..."
            : "ADD TO CART"}
        </Button>
      ) : (
        <div className={cn("relative flex items-center border rounded-lg w-full overflow-hidden", compact ? "h-8" : "h-9")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={
              currentQuantity <= productMinQty
                ? handleRemoveFromCart
                : handleDecrement
            }
            disabled={isButtonLoading}
            className={cn(
              "rounded-r-none h-full flex items-center justify-center",
              compact ? "w-10" : "w-12"
            )}
          >
            {currentQuantity <= productMinQty ? (
              <Trash2 className={cn("text-red-500", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
            ) : (
              <Minus className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
            )}
          </Button>
          <div className={cn(
            "flex-1 text-center font-semibold border-x py-1 h-full flex items-center justify-center",
            compact ? "text-[10px]" : "text-sm"
          )}>
            {currentQuantity}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleIncrement}
            disabled={isButtonLoading}
            className={cn(
              "rounded-l-none h-full flex items-center justify-center",
              compact ? "w-10" : "w-12"
            )}
          >
            <Plus className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
          </Button>
          {/* Progress loader at bottom */}
          {isButtonLoading && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20 overflow-hidden rounded-b-lg">
              <div 
                className="h-full w-1/2 bg-primary"
                style={{
                  animation: 'progress-slide 1.5s ease-in-out infinite'
                }}
              />
            </div>
          )}
        </div>
      )}
      {errorMessage && (
        <p className="text-xs text-red-500 text-center mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
