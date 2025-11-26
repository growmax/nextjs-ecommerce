"use client";

import PricingFormat from "@/components/PricingFormat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useModuleSettings from "@/hooks/useModuleSettings";
import useUser from "@/hooks/useUser";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";

interface TargetDiscountCardProps {
  isContentPage?: boolean;
  isSummaryPage?: boolean;
}

/**
 * TargetDiscountCard component for quote summary pages
 * Migrated from buyer-fe/src/components/Summary/Components/TargetDiscountCard/TargetDiscountCard.js
 * 
 * Allows users to set target discount or target price, which automatically calculates
 * revised product prices for Special Price Request (SPR)
 */
export default function TargetDiscountCard({
  isContentPage = false,
  isSummaryPage = true,
}: TargetDiscountCardProps) {
  const { setValue, watch, trigger, formState: { errors } } = useFormContext();
  const { companydata } = useUser();
  const { quoteSettings } = useModuleSettings();
  
  const roundOff = (companydata as any)?.roundOff || 2;

  // Watch form values
  const targetPrice = (watch("sprDetails.targetPrice" as any) as number) || 0;
  const sprRequestedDiscount = (watch("sprDetails.sprRequestedDiscount" as any) as number) || 0;
  const cartValue = (watch("cartValue" as any) as any) || {};
  const products = (watch("products") as any[]) || [];

  // Check if should show the card
  // Reference: buyer-fe line 227 - shows if isSummaryPage OR (targetPrice > 0 || sprRequestedDiscount > 0)
  const shouldShow = useMemo(() => {
    if (isSummaryPage) {
      return true; // Always show on summary pages
    }
    return (targetPrice > 0 || sprRequestedDiscount > 0);
  }, [isSummaryPage, targetPrice, sprRequestedDiscount]);

  /**
   * Update products with revised values based on target price
   * Reference: buyer-fe lines 85-106, 167-190
   */
  const updateProductsWithRevisedValues = (targetPriceValue: number, totalValue: number) => {
    const revisedProducts = products.map((item: any) => {
      // Calculate contribution percentage
      const contribution = parseFloat(
        ((item.totalPrice / totalValue) * 100).toFixed(roundOff)
      );

      // Calculate revised value for this item
      const revisedValue = parseFloat(
        ((targetPriceValue * contribution) / 100).toFixed(roundOff)
      );

      // Calculate buyer requested price per unit
      const askedQuantity = item.askedQuantity || item.quantity || 1;
      let buyerRequestedPrice = parseFloat(
        (revisedValue / askedQuantity).toFixed(roundOff)
      );
      buyerRequestedPrice = isNaN(buyerRequestedPrice) ? 0 : buyerRequestedPrice;

      // Calculate buyer requested discount percentage
      const buyerRequestedDiscount = parseFloat(
        (((item.unitPrice - buyerRequestedPrice) / item.unitPrice) * 100).toFixed(roundOff)
      );

      return {
        ...item,
        contribution,
        revisedValue,
        buyerRequestedPrice,
        buyerRequestedDiscount: isNaN(buyerRequestedDiscount) ? 0 : buyerRequestedDiscount,
      };
    });

    setValue("products", revisedProducts, { shouldDirty: false });
  };

  /**
   * Update SPR flags based on target price
   * Reference: buyer-fe lines 112-140, 196-224
   */
  const updateSPRFlags = (targetPriceValue: number, totalValue: number) => {
    const isSPRRequested = parseFloat(targetPriceValue.toFixed(roundOff)) < totalValue;

    setValue("isSPRRequested" as any, isSPRRequested);
    trigger("isSPRRequested" as any);
    setValue("sprDetails.spr" as any, isSPRRequested ? (quoteSettings?.spr || false) : false);
  };

  /**
   * Auto-update targetPrice when cartValue.totalValue changes (e.g., after cash discount is applied)
   * Reference: buyer-fe doesn't have explicit useEffect, but handleTargetDiscountChange always uses
   * current cartValue.totalValue from getValues(), so it automatically uses updated values.
   * However, we need to auto-update targetPrice when totalValue changes if there's an existing discount.
   * 
   * This ensures that when cash discount is applied and totalValue changes:
   * - If sprRequestedDiscount > 0: Recalculate targetPrice based on new totalValue and existing discount %
   * - If sprRequestedDiscount = 0: Set targetPrice to new totalValue (no discount)
   */
  useEffect(() => {
    const totalValue = cartValue?.totalValue || 0;
    const currentTargetPrice = targetPrice || 0;
    const currentDiscount = sprRequestedDiscount || 0;

    // Skip if totalValue is not available yet
    if (totalValue <= 0) {
      return;
    }

    // If there's an existing discount percentage, recalculate targetPrice based on new totalValue
    if (currentDiscount > 0) {
      const calculatedTargetPrice = parseFloat(
        (totalValue - (totalValue * currentDiscount) / 100).toFixed(roundOff)
      );

      // Only update if the calculated value is different (with small tolerance for rounding)
      // This prevents infinite loops and unnecessary updates
      if (Math.abs(calculatedTargetPrice - currentTargetPrice) > 0.01) {
        setValue("sprDetails.targetPrice" as any, calculatedTargetPrice, { shouldDirty: false });
        // Update products with revised values based on new targetPrice
        updateProductsWithRevisedValues(calculatedTargetPrice, totalValue);
        // Update SPR flags
        updateSPRFlags(calculatedTargetPrice, totalValue);
      }
    } else {
      // If discount is 0, target price should equal totalValue (the discounted subtotal)
      // This matches the behavior where targetPrice reflects the current subtotal after cash discount
      if (currentTargetPrice === 0 || Math.abs(totalValue - currentTargetPrice) > 0.01) {
        setValue("sprDetails.targetPrice" as any, totalValue, { shouldDirty: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartValue?.totalValue, sprRequestedDiscount, roundOff, setValue]);

  /**
   * Handle target discount change
   * Reference: buyer-fe lines 70-141
   */
  const handleTargetDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseFloat(e.target.value) : 0;
    setValue("sprDetails.sprRequestedDiscount" as any, val);

    // Calculate target price from discount
    const totalValue = cartValue?.totalValue || 0;
    const calculatedTargetPrice = parseFloat(
      (totalValue - (totalValue * val) / 100).toFixed(roundOff)
    );
    setValue("sprDetails.targetPrice" as any, calculatedTargetPrice);

    // Update products with revised values
    updateProductsWithRevisedValues(calculatedTargetPrice, totalValue);

    // Update SPR flags
    updateSPRFlags(calculatedTargetPrice, totalValue);
  };

  /**
   * Handle target price change
   * Reference: buyer-fe lines 143-225
   */
  const handleTargetPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseFloat(e.target.value) : 0;
    setValue("sprDetails.targetPrice" as any, val);

    // Calculate discount from target price
    const totalValue = cartValue?.totalValue || 0;
    let calculatedDiscount = parseFloat(
      (100 - (val / totalValue) * 100).toFixed(roundOff)
    );

    // Clamp discount between 0 and 100
    calculatedDiscount = calculatedDiscount < 0 ? 0 : calculatedDiscount > 100 ? 100 : calculatedDiscount;
    setValue("sprDetails.sprRequestedDiscount" as any, calculatedDiscount);

    // Update products with revised values
    updateProductsWithRevisedValues(val, totalValue);

    // Update SPR flags
    updateSPRFlags(val, totalValue);
  };

  /**
   * Auto-update targetPrice when cartValue.totalValue changes (e.g., after cash discount is applied)
   * Reference: buyer-fe doesn't have explicit useEffect, but handleTargetDiscountChange always uses
   * current cartValue.totalValue from getValues(), so it automatically uses updated values.
   * However, we need to auto-update targetPrice when totalValue changes if there's an existing discount.
   * 
   * This ensures that when cash discount is applied and totalValue changes:
   * - If sprRequestedDiscount > 0: Recalculate targetPrice based on new totalValue and existing discount %
   * - If sprRequestedDiscount = 0: Set targetPrice to new totalValue (no discount)
   */
  useEffect(() => {
    const totalValue = cartValue?.totalValue || 0;
    const currentTargetPrice = targetPrice || 0;
    const currentDiscount = sprRequestedDiscount || 0;

    // Skip if totalValue is not available yet
    if (totalValue <= 0) {
      return;
    }

    // If there's an existing discount percentage, recalculate targetPrice based on new totalValue
    if (currentDiscount > 0) {
      const calculatedTargetPrice = parseFloat(
        (totalValue - (totalValue * currentDiscount) / 100).toFixed(roundOff)
      );

      // Only update if the calculated value is different (with small tolerance for rounding)
      // This prevents infinite loops and unnecessary updates
      if (Math.abs(calculatedTargetPrice - currentTargetPrice) > 0.01) {
        setValue("sprDetails.targetPrice" as any, calculatedTargetPrice, { shouldDirty: false });
        // Update products with revised values based on new targetPrice
        updateProductsWithRevisedValues(calculatedTargetPrice, totalValue);
        // Update SPR flags
        updateSPRFlags(calculatedTargetPrice, totalValue);
      }
    } else {
      // If discount is 0, target price should equal totalValue (the discounted subtotal)
      // This matches the behavior where targetPrice reflects the current subtotal after cash discount
      if (currentTargetPrice === 0 || Math.abs(totalValue - currentTargetPrice) > 0.01) {
        setValue("sprDetails.targetPrice" as any, totalValue, { shouldDirty: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartValue?.totalValue, sprRequestedDiscount, roundOff, setValue]);

  if (!shouldShow) {
    return null;
  }

  const sprDetailsErrors = (errors as any)?.sprDetails;
  const targetDiscountError = sprDetailsErrors?.sprRequestedDiscount;
  const targetPriceError = sprDetailsErrors?.targetPrice;

  return (
    <Card className="shadow-sm mt-4">
      <CardHeader className="px-6 py-4 bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Target Discount
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="space-y-4">
          {/* Target Discount Input */}
          {isContentPage ? (
            <div className="flex justify-between items-center py-2">
              <Label className="text-sm font-normal text-gray-900 w-1/2">
                Total Discount
              </Label>
              <div className="text-sm font-semibold text-gray-900 w-1/2 text-right">
                {sprRequestedDiscount.toFixed(roundOff)}%
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="targetDiscount" className="text-sm font-medium">
                Target Discount
              </Label>
              <Input
                id="targetDiscount"
                type="number"
                value={sprRequestedDiscount || 0}
                onChange={handleTargetDiscountChange}
                className={targetDiscountError ? "border-red-500" : ""}
              />
              {targetDiscountError && (
                <p className="text-sm text-red-500">
                  {targetDiscountError.message as string}
                </p>
              )}
            </div>
          )}

          {/* Target Price Input */}
          {isContentPage ? (
            <div className="flex justify-between items-center py-2">
              <Label className="text-sm font-normal text-gray-900 w-1/2">
                Target Price (Excl. taxes)
              </Label>
              <div className="text-sm font-semibold text-gray-900 w-1/2 text-right">
                <PricingFormat value={targetPrice || 0} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="targetPrice" className="text-sm font-medium">
                Target Price (Excl. taxes)
              </Label>
              <Input
                id="targetPrice"
                type="number"
                value={targetPrice || ""}
                onChange={handleTargetPriceChange}
                className={targetPriceError ? "border-red-500" : ""}
              />
              {targetPriceError && (
                <p className="text-sm text-red-500">
                  {targetPriceError.message as string}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

