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
import { Minus, Plus, Trash2 } from "lucide-react";
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
    console.log("🟢 [CartProductCard] handleQuantityChange called", {
      productId: item.productId,
      currentQuantity: item.quantity,
      newQuantity,
      itemNo: item.itemNo,
      sellerId: item.sellerId,
    });

    if (newQuantity < 1) {
      console.warn("⚠️ [CartProductCard] Quantity < 1, returning early");
      return;
    }

    setIsUpdating(true);
    setErrorMessage(false);

    const setError = (error: string | false) => {
      setErrorMessage(error);
    };

    try {
      console.log("📞 [CartProductCard] Calling changeQty with:", {
        productId: Number(item.productId),
        itemNo: item.itemNo,
        quantity: newQuantity,
        sellerId: item.sellerId,
      });

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

      console.log("✅ [CartProductCard] changeQty completed successfully");

      if (onUpdate) {
        onUpdate(newQuantity);
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
            Qty: {item.quantity} ×{" "}
            {isPricingLoading ? (
              <Skeleton className="inline-block h-3 w-12" />
            ) : pricingResult ? (
              <PricingFormat value={pricingResult.final_listing_price} />
            ) : (
              <span className="text-xs">Request Price</span>
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
          <span className="w-8 text-center text-sm">{item.quantity}</span>
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
      <CardContent className="p-4">
        <div className="flex gap-6 relative">
          {/* Product Image - Left */}
          <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
            <ImageWithFallback
              src={item.img}
              alt={item.productName || `Product ${item.productId}`}
              fill
              className="object-cover rounded-lg"
              sizes="96px"
            />
          </div>

          {/* Product Info - Center */}
          <div className="flex-1 min-w-0">
            {/* Title - Product Short Description */}
            <h3 className="font-bold text-base mb-1">
              {item.productShortDescription ||
                item.shortDescription ||
                item.productName ||
                `Product ${item.productId}`}
            </h3>

            {/* Brand Name and Product ID */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              {item.brandName || item.brandsName ? (
                <>
                  <span>{item.brandName || item.brandsName}</span>
                  {item.itemNo && <span>•</span>}
                </>
              ) : null}
              {item.itemNo && <span>{item.itemNo}</span>}
            </div>

            {/* Seller */}
            {item.sellerName && (
              <p className="text-sm text-gray-500 mb-2">
                Seller: {item.sellerName}
                {item.sellerLocation && ` - ${item.sellerLocation}`}
              </p>
            )}

            {/* Price Display */}
            <div className="flex flex-col gap-1 mb-2">
              {pricingResult && (
                <>
                  <ProductPricing
                    pricingResult={{
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
                    }}
                    pricingConditions={pricingConditions}
                    loading={isPricingLoading}
                    variant="default"
                    showDiscountBadge={true}
                    showMRPLabel={true}
                  />
                  {/* Tax Inclusive Note */}
                  {!taxExempted && item.taxInclusive && (
                    <span className="text-xs text-blue-600">
                      Inclusive of all taxes
                    </span>
                  )}
                </>
              )}
              {!pricingResult &&
                // Fallback: show unitPrice if available when no pricingResult
                (item.unitPrice && item.unitPrice > 0 ? (
                  <span className="font-bold text-base">
                    <PricingFormat value={item.unitPrice} />
                  </span>
                ) : item.unitListPrice && item.unitListPrice > 0 ? (
                  <span className="font-bold text-base">
                    <PricingFormat value={item.unitListPrice} />
                  </span>
                ) : (
                  <span className="font-bold text-base">Request Price</span>
                ))}
            </div>

            {/* Quantity, Pack of, and MOQ */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>{item.quantity}</span>
              {(item.packagingQuantity || item.packagingQty) && (
                <>
                  <span>•</span>
                  <span>
                    Pack of {item.packagingQuantity || item.packagingQty}
                  </span>
                </>
              )}
              {item.minOrderQuantity && (
                <>
                  <span>•</span>
                  <span>MOQ {item.minOrderQuantity}</span>
                </>
              )}
            </div>

            {/* Inventory Status */}
            {item.inventoryResponse !== undefined && (
              <p
                className={`text-sm font-bold ${
                  item.inventoryResponse.inStock
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.inventoryResponse.inStock ? "In Stock" : "Out Of Stock"}
              </p>
            )}

            {item.replacement && (
              <p className="text-xs text-orange-600 mb-1 mt-1">
                Replacement Product
              </p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Right Section - Quantity Controls and Delete */}
          <div className="flex flex-col items-end gap-3">
            {/* Delete Button - Top Right */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md hover:bg-gray-200"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {/* Quantity Controls - Square rounded buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md border-gray-300 hover:bg-gray-100"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium text-base">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md border-gray-300 hover:bg-gray-100"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
