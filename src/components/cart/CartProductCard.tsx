"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import PricingFormat from "@/components/PricingFormat";
import ProductPricing from "@/components/product/ProductPricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import type { CartItem } from "@/types/calculation/cart";
import { getSuitableDiscountByQuantity } from "@/utils/calculation/discountCalculation/discountCalculation";
import { BuildPricingCond } from "@/utils/pricing/buildPricingCond";
import { getProductPricing } from "@/utils/pricing/getProductPricing";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

interface CartProductCardProps {
  item: CartItem;
  onUpdate?: (quantity: number) => void;
  onDelete?: () => void;
  compact?: boolean;
  isPricingLoading?: boolean;
}

export default function CartProductCard({
  item,
  onUpdate,
  onDelete,
  compact = false,
  isPricingLoading = false,
}: CartProductCardProps) {
  const { changeQty, DeleteCart } = useCart();
  const t = useTranslations("cart");

  // Get taxExempted from JWT token
  const taxExempted = useMemo(() => {
    try {
      const token = AuthStorage.getAccessToken();
      if (token) {
        const jwtService = JWTService.getInstance();
        const payload = jwtService.decodeToken(token) as {
          taxExempted?: boolean;
        };
        return payload?.taxExempted ?? false;
      }
    } catch {
      // If JWT decode fails, default to false
    }
    return false;
  }, []);

  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | false>(false);

  // Extract product image source
  const productImageSrc = useMemo(() => {
    // Priority 1: Direct access to productAssetss array - get first image source
    if (item.productAsset && Array.isArray(item.productAsset) && item.productAsset.length > 0) {
      // Direct access to first asset's source
      const firstAsset = item.productAsset[0];
      if (firstAsset && firstAsset.source) {
        const source = String(firstAsset.source).trim();
        if (source && source !== "") {
          return source;
        }
      }
    }
    
    // Priority 2: Check item.img (which might already be set from productAssetss)
    if (item.img) {
      const imgSrc = String(item.img).trim();
      if (imgSrc && imgSrc !== "") {
        return imgSrc;
      }
    }
    
    // Priority 3: Return empty string (will show placeholder)
    return "";
  }, [item.productAsset, item.img]);

  // Get suitable discount based on quantity
  const { suitableDiscount } = useMemo(() => {
    const discountsList = item.disc_prd_related_obj?.discounts || [];
    const packagingQty = item.packagingQuantity || item.packagingQty || 1;
    return getSuitableDiscountByQuantity(
      item.quantity,
      discountsList,
      packagingQty
    );
  }, [
    item.quantity,
    item.disc_prd_related_obj?.discounts,
    item.packagingQuantity,
    item.packagingQty,
  ]);

  // Calculate pricing
  const pricingResult = useMemo(() => {
    if (isPricingLoading) {
      return null;
    }
    const productDiscountsData = {
      MasterPrice:
        item.MasterPrice ?? item.disc_prd_related_obj?.MasterPrice ?? null,
      BasePrice: item.BasePrice ?? item.disc_prd_related_obj?.BasePrice ?? null,
      isProductAvailableInPriceList:
        item.isProductAvailableInPriceList ??
        item.disc_prd_related_obj?.isProductAvailableInPriceList ??
        true,
      isOveridePricelist:
        item.disc_prd_related_obj?.isOveridePricelist ?? false,
    };

    // Create item with suitable discount applied
    const itemWithDiscount: CartItem = {
      ...item,
      discount:
        suitableDiscount?.Value ??
        item.discount ??
        item.discountPercentage ??
        0,
      ...(suitableDiscount && {
        discountDetails: {
          ...item.discountDetails,
          BasePrice:
            item.BasePrice ?? item.disc_prd_related_obj?.BasePrice ?? 0,
        },
      }),
    };

    return getProductPricing(
      itemWithDiscount,
      productDiscountsData,
      taxExempted
    );
  }, [item, suitableDiscount, taxExempted, isPricingLoading]);

  // Build pricing conditions
  const pricingConditions = useMemo(() => {
    if (isPricingLoading) {
      return {
        ShowRequestPrice: false,
        ShowBasePrice: false,
        ShowDiscount: false,
      };
    }
    return BuildPricingCond(item, suitableDiscount);
  }, [item, suitableDiscount, isPricingLoading]);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      console.warn("⚠️ [CartProductCard] Quantity < 1, returning early");
      return;
    }

    // Prevent duplicate calls if already updating
    if (isUpdating) {
      console.warn("⚠️ [CartProductCard] Already updating, ignoring duplicate call");
      return;
    }

    setIsUpdating(true);
    setErrorMessage(false);

    const setError = (error: string | false) => {
      setErrorMessage(error);
    };

    try {
      // If parent provides onUpdate callback, use it (parent handles the changeQty call)
      // Otherwise, handle changeQty directly in this component
      if (onUpdate) {
        await onUpdate(newQuantity);
      } else {
        // Fallback: call changeQty directly when no parent callback
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
          setError
        );
      }
    } catch (error) {
      console.error("❌ [CartProductCard] Error updating quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      // If parent provides onDelete callback, use it (parent handles the delete)
      // Otherwise, handle delete directly in this component
      if (onDelete) {
        await onDelete();
      } else {
        await DeleteCart(
          Number(item.productId),
          item.itemNo || "",
          item.sellerId
        );
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (compact) {
    return (
      <div className="flex items-center justify-between p-2 border rounded">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {item.productShortDescription ||
              item.shortDescription ||
              item.productName ||
              `Product ${item.productId}`}
          </p>
          <p className="text-xs text-gray-500">
            {t("qty")}: {item.quantity} ×{" "}
            {isPricingLoading ? (
              <Skeleton className="inline-block h-3 w-12" />
            ) : pricingResult ? (
              <PricingFormat value={pricingResult.final_listing_price} />
            ) : (
              <span className="text-xs">{t("requestPrice")}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm relative flex items-center justify-center">
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            ) : (
              item.quantity
            )}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }
 
 
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3 sm:gap-6 relative">
          {/* Product Image - Left */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
            <ImageWithFallback
              src={productImageSrc || item.img || ""}
              alt={item.productName || `Product ${item.productId}`}
              fill
              className="object-cover rounded-lg"
              sizes="96px"
              {...((productImageSrc?.startsWith("http") || item.img?.startsWith("http")) && { unoptimized: true })}
            />
          </div>

          {/* Product Info - Center */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Title - Product Short Description */}
            <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-2">
              {item.productShortDescription ||
                item.shortDescription ||
                item.productName ||
                `Product ${item.productId}`}
            </h3>

            {/* Brand Name and Product ID */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-1.5">
              {item.brandName || item.brandsName ? (
                <>
                  <span className="truncate">{item.brandName || item.brandsName}</span>
                  {item.itemNo && <span>•</span>}
                </>
              ) : null}
              {item.itemNo && <span className="truncate">{item.itemNo}</span>}
            </div>

            {/* Seller - Hidden on mobile */}
            {item.sellerName && (
              <p className="hidden sm:block text-xs sm:text-sm text-gray-500 mb-1.5 sm:mb-2 line-clamp-1">
                {t("seller")}: {item.sellerName}
                {item.sellerLocation && ` - ${item.sellerLocation}`}
              </p>
            )}

            {/* Price Display - Reduced font size on mobile */}
            <div className="flex flex-col gap-1 mb-2.5 sm:mb-2 min-h-[24px] sm:min-h-[28px]">
              <div className="min-h-[24px] sm:min-h-[28px] flex items-center">
                <ProductPricing
                  pricingResult={pricingResult ? {
                    final_Price: pricingResult.final_Price,
                    final_listing_price: pricingResult.final_listing_price,
                    ...(pricingResult.discounted_Price !== undefined && {
                      discounted_Price: pricingResult.discounted_Price,
                    }),
                    ...(pricingResult.discount_Percentage !== undefined && {
                      discount_Percentage: pricingResult.discount_Percentage,
                    }),
                    ...(pricingResult.isPriceNotAvailable !== undefined && {
                      isPriceNotAvailable: pricingResult.isPriceNotAvailable,
                    }),
                  } : null}
                  pricingConditions={pricingConditions}
                  loading={isPricingLoading}
                  variant="default"
                  showDiscountBadge={false}
                  showMRPLabel={true}
                  {...(item.discount || item.discountPercentage
                    ? {
                        discountPercentage:
                          item.discount ?? item.discountPercentage ?? 0,
                      }
                    : {})}
                />
              </div>
              {/* Tax Inclusive Note */}
              {!taxExempted && item.taxInclusive && !isPricingLoading && pricingResult && (
                <span className="text-[10px] sm:text-xs text-blue-600">
                  {t("inclusiveOfAllTaxes")}
                </span>
              )}
            </div>

            {/* Quantity Controls - Mobile: At bottom of price detail */}
            <div className="flex items-center gap-2.5 sm:hidden mb-2.5">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-md border-gray-300 hover:bg-gray-100 active:bg-gray-200"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
              >
                {isUpdating ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Minus className="h-5 w-5" />
                )}
              </Button>
              <span className="w-12 text-center font-semibold text-base relative">
                {isUpdating ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                ) : (
                  item.quantity
                )}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-md border-gray-300 hover:bg-gray-100 active:bg-gray-200"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Quantity, Pack of, and MOQ */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-1 whitespace-nowrap overflow-hidden">
              <span className="shrink-0">{item.quantity}</span>
              {(item.packagingQuantity || item.packagingQty) && (
                <>
                  <span className="shrink-0">•</span>
                  <span className="shrink-0">
                    {t("packOf")} {item.packagingQuantity || item.packagingQty}
                  </span>
                </>
              )}
              {item.minOrderQuantity && (
                <>
                  <span className="shrink-0">•</span>
                  <span className="shrink-0">
                    {t("moq")} {item.minOrderQuantity}
                  </span>
                </>
              )}
            </div>

            {/* Inventory Status */}
            {item.inventoryResponse !== undefined && (
              <p
                className={`text-xs sm:text-sm font-semibold mb-0.5 ${
                  item.inventoryResponse.inStock
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.inventoryResponse.inStock
                  ? t("inStock")
                  : t("outOfStock")}
              </p>
            )}

            {item.replacement && (
              <p className="text-xs text-orange-600 mb-0.5 mt-0.5">
                {t("replacementProduct")}
              </p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
            )}
          </div>

          {/* Right Section - Delete Button and Total Price (Desktop: includes quantity controls) */}
          <div className="flex flex-col items-end gap-2.5 sm:gap-3 shrink-0 self-start">
            {/* Delete Button and Total Price - Vertical Layout */}
            <div className="flex flex-col items-end gap-2 sm:gap-2">
              {/* Delete Button - First (Top) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-8 sm:w-8 rounded-md hover:bg-gray-200 active:bg-gray-300 shrink-0"
                onClick={handleDelete}
                disabled={isUpdating}
              >
                <Trash2 className="h-4 w-4 sm:h-4 sm:w-4" />
              </Button>
              {/* Total Price (Price × Quantity) - Hidden on mobile, no skeleton */}
              {isPricingLoading && (
                 <div className="hidden sm:block text-right">
                   <Skeleton className="h-4 w-20" />
                 </div>
              )}
              {!isPricingLoading && (() => {
                const unitPrice = pricingResult
                  ? pricingResult.final_listing_price
                  : item.unitPrice || item.unitListPrice || 0;
                const totalPrice = unitPrice * item.quantity;
                
                if (totalPrice > 0) {
                  return (
                    <div className="hidden sm:block text-right">
                      <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                        <PricingFormat value={totalPrice} />
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Quantity Controls - Desktop only (hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 relative">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-md border-gray-300 hover:bg-gray-100"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-primary" />
                ) : (
                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>
              <span className="w-7 sm:w-8 text-center font-medium text-sm sm:text-base relative">
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mx-auto text-primary" />
                ) : (
                  item.quantity
                )}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-md border-gray-300 hover:bg-gray-100"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-primary" />
                ) : (
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
