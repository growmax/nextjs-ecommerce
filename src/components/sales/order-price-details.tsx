"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted } from "@/components/ui/typography";
import {
  cartCalculation,
  discountDetails,
} from "@/utils/calculation/cartCalculation";
import {
  calculateShippingTax,
  setTaxBreakup,
} from "@/utils/calculation/tax-breakdown";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import PricingFormat from "../PricingFormat";

interface TaxDetail {
  name: string;
  value: number;
}

interface OrderPriceDetailsProps {
  products?: any[];
  isInter?: boolean;
  insuranceCharges?: number;
  precision?: number;
  Settings?: any;
  isSeller?: boolean;
  taxExemption?: boolean;
  currency?: string;
  // API values from order details - use these when available
  overallShipping?: number;
  overallTax?: number;
  calculatedTotal?: number;
  subTotal?: number;
  taxableAmount?: number;
}

export default function OrderPriceDetails({
  products = [],
  isInter = true,
  insuranceCharges = 0,
  precision = 2,
  Settings = {},
  isSeller = false,
  taxExemption = false,
  currency: _currency = "INR ₹",
  overallShipping,
  overallTax,
  calculatedTotal,
  subTotal,
  taxableAmount,
}: OrderPriceDetailsProps) {
  const t = useTranslations("components");
  const [taxExpanded, setTaxExpanded] = useState(false);

  // Use calculated values from props if available, otherwise calculate
  const cartValue = useMemo(() => {
    // If calculated values are provided, use them directly
    // Check if calculatedTotal is explicitly provided (not undefined, even if 0)
    const hasCalculatedValues =
      calculatedTotal !== undefined &&
      subTotal !== undefined &&
      taxableAmount !== undefined &&
      overallTax !== undefined;

    if (hasCalculatedValues) {
      // Calculate pfRate and totalLP from products if available
      let pfRateFromProducts = 0;
      let totalLPFromProducts = 0;
      let totalBasicDiscountFromProducts = 0;

      if (products && products.length > 0) {
        products.forEach((product: any) => {
          pfRateFromProducts += product.pfRate || 0;
          totalLPFromProducts +=
            (product.unitListPrice || product.unitLP || 0) *
            (product.quantity || product.askedQuantity || 1);

          // Calculate basic discount if list price > unit price
          const qty = product.quantity || product.askedQuantity || 1;
          const listPrice = product.unitListPrice || product.unitLP || 0;
          const unitPrice = product.unitPrice || product.discountedPrice || 0;
          if (listPrice > unitPrice) {
            totalBasicDiscountFromProducts += (listPrice - unitPrice) * qty;
          }
        });
      }

      // If we can't calculate pfRate from products, derive it from taxableAmount and subTotal
      const calculatedPfRate =
        pfRateFromProducts > 0
          ? pfRateFromProducts
          : taxableAmount -
            subTotal -
            (overallShipping !== undefined && overallShipping !== null
              ? overallShipping
              : 0);

      return {
        totalItems: products?.length || 0,
        totalLP: totalLPFromProducts,
        totalBasicDiscount: totalBasicDiscountFromProducts,
        totalCashDiscount: 0,
        totalValue: subTotal,
        totalTax: overallTax,
        totalShipping: overallShipping !== undefined ? overallShipping : 0,
        pfRate: calculatedPfRate > 0 ? calculatedPfRate : 0,
        taxableAmount,
        grandTotal: calculatedTotal,
        hideListPricePublic: totalLPFromProducts === 0,
      };
    }

    // Otherwise, calculate from products
    if (!products || products.length === 0) {
      return {
        totalItems: 0,
        totalLP: 0,
        totalBasicDiscount: 0,
        totalCashDiscount: 0,
        totalValue: 0,
        totalTax: 0,
        totalShipping: 0,
        pfRate: 0,
        taxableAmount: 0,
        grandTotal: 0,
        hideListPricePublic: false,
      };
    }

    // Normalize products to ensure they have the expected structure
    // Map askedQuantity to quantity if needed, and ensure other fields exist
    const normalizedProducts = products.map(product => {
      // Convert productTaxes to hsnDetails structure if needed
      let hsnDetails = product.hsnDetails;

      if (
        !hsnDetails &&
        product.productTaxes &&
        Array.isArray(product.productTaxes)
      ) {
        // Calculate total tax from productTaxes
        const totalTax = product.productTaxes.reduce(
          (sum: number, tax: { taxPercentage?: number }) =>
            sum + (tax.taxPercentage || 0),
          product.tax || 0
        );

        // Convert productTaxes to taxReqLs format
        const taxReqLs = product.productTaxes.map(
          (tax: {
            taxName?: string;
            taxPercentage?: number;
            compound?: boolean;
          }) => ({
            taxName: tax.taxName || "",
            rate: tax.taxPercentage || 0,
            compound: tax.compound || false,
          })
        );

        hsnDetails = {
          hsnCode: product.hsnCode || "",
          tax: totalTax,
          interTax: {
            totalTax,
            taxReqLs,
          },
          intraTax: {
            totalTax,
            taxReqLs,
          },
        };
      }

      // Calculate pfItemValue from pfPercentage or pfValue
      // pfPercentage is the percentage (e.g., 12 means 12%)
      let pfItemValue = product.pfItemValue;
      if (!pfItemValue && pfItemValue !== 0) {
        if (
          product.pfPercentage !== undefined &&
          product.pfPercentage !== null
        ) {
          pfItemValue = product.pfPercentage;
        } else if (
          product.pfValue !== undefined &&
          product.pfValue !== null &&
          product.pfValue < 100
        ) {
          // If pfValue is less than 100, it's likely a percentage
          pfItemValue = product.pfValue;
        } else {
          pfItemValue = 0;
        }
      }

      // Use existing totalPrice from API if available, otherwise calculate
      const quantity = product.quantity || product.askedQuantity || 1;
      const unitPrice =
        product.unitPrice ||
        product.discountedPrice ||
        product.unitListPrice ||
        0;
      // Don't overwrite totalPrice if it's already calculated correctly in the API
      const totalPrice =
        product.totalPrice !== undefined && product.totalPrice !== null
          ? product.totalPrice
          : quantity * unitPrice;

      return {
        ...product,
        quantity,
        askedQuantity: quantity,
        unitListPrice: product.unitListPrice || product.unitLP || 0,
        unitPrice,
        totalPrice,
        shippingCharges: product.shippingCharges || 0,
        pfItemValue,
        pfPercentage: pfItemValue,
        cashdiscountValue:
          product.cashdiscountValue || product.cashDiscountValue || 0,
        hsnDetails: hsnDetails || {},
        listPricePublic:
          product.listPricePublic !== undefined
            ? product.listPricePublic
            : true,
        discount: product.discount || product.discountPercentage || 0,
        discountPercentage: product.discount || product.discountPercentage || 0,
        tax: product.tax || hsnDetails?.tax || 0,
        showPrice: product.showPrice !== undefined ? product.showPrice : true,
        priceNotAvailable: product.priceNotAvailable || false,
        volumeDiscountApplied: product.volumeDiscountApplied || false,
      };
    });

    // Preprocess products with discountDetails
    const processedProducts = discountDetails(
      normalizedProducts,
      isSeller,
      taxExemption,
      precision
    );

    // Calculate cart totals using cartCalculation
    const calculatedValue = cartCalculation(
      processedProducts,
      isInter,
      insuranceCharges,
      precision,
      Settings
    );

    // Only calculate shipping tax if products have proper hsnDetails
    // and we're not using API-provided values
    const hasHsnDetails = processedProducts.some(
      (p: any) =>
        p.hsnDetails && (p.hsnDetails.interTax || p.hsnDetails.intraTax)
    );

    if (hasHsnDetails) {
      try {
        const shippingTaxResult = calculateShippingTax(
          calculatedValue.totalShipping || 0,
          calculatedValue,
          processedProducts,
          false, // isBeforeTax - set to false by default
          isInter,
          precision,
          false // itemWiseShippingTax - set to false by default
        );
        return shippingTaxResult.cartValue;
      } catch (error) {
        console.error("Error calculating shipping tax:", error);
        return calculatedValue;
      }
    }

    return calculatedValue;
  }, [
    products,
    isInter,
    insuranceCharges,
    precision,
    Settings,
    isSeller,
    taxExemption,
    calculatedTotal,
    subTotal,
    taxableAmount,
    overallShipping,
    overallTax,
  ]);

  // Extract tax breakdown from cartValue (pre-calculated) or fallback to manual calculation
  const taxBreakup = useMemo(() => {
    const breakup: TaxDetail[] = [];

    // First, try to use pre-calculated tax totals from cartValue
    const cartValueKeys = Object.keys(cartValue);
    const taxTotalKeys = cartValueKeys.filter(
      key =>
        key.endsWith("Total") &&
        key !== "totalTax" &&
        key !== "grandTotal" &&
        key !== "calculatedTotal" &&
        key !== "totalLP" &&
        key !== "totalShipping" &&
        key !== "totalValue" &&
        key !== "totalItems" &&
        key !== "totalBasicDiscount" &&
        key !== "totalCashDiscount"
    );

    if (taxTotalKeys.length > 0) {
      // Use pre-calculated tax totals from cartValue
      taxTotalKeys.forEach(key => {
        const taxName = key.replace("Total", ""); // Remove 'Total' suffix to get tax name
        const taxValue = cartValue[key];
        if (taxValue && taxValue > 0) {
          breakup.push({
            name: taxName,
            value: taxValue,
          });
        }
      });

      return breakup;
    }

    // Fallback: Try to get tax breakup from products
    if (!products || products.length === 0) {
      return breakup;
    }

    // Get tax breakup structure from products
    try {
      const taxBreakupList = setTaxBreakup(products, isInter);

      if (taxBreakupList && taxBreakupList.length > 0) {
        // Calculate tax totals for each tax type
        const taxMap = new Map<string, number>();

        products.forEach(product => {
          taxBreakupList.forEach((taxItem: any) => {
            const taxName = taxItem.taxName || taxItem.name;
            const taxPercentage = product[taxName] || 0;

            if (taxName && taxPercentage > 0) {
              const quantity = product.quantity || product.askedQuantity || 1;
              const unitPrice =
                product.unitPrice ||
                product.discountedPrice ||
                (product.totalPrice ? product.totalPrice / quantity : 0) ||
                0;
              const productTotal = product.totalPrice || quantity * unitPrice;
              const pfRate = product.pfRate || 0;

              // Calculate tax amount: (totalPrice + pfRate) * taxPercentage / 100
              const taxAmount = ((productTotal + pfRate) * taxPercentage) / 100;

              const currentTotal = taxMap.get(taxName) || 0;
              taxMap.set(taxName, currentTotal + taxAmount);
            }
          });
        });

        // Convert map to array
        taxMap.forEach((value, name) => {
          if (value > 0) {
            breakup.push({
              name,
              value: Number(value.toFixed(precision)),
            });
          }
        });

        return breakup;
      }
    } catch (error) {
      console.error("Error calculating tax breakup:", error);
    }

    // If we still don't have any breakdown but we have a tax amount, create a generic breakdown
    if (breakup.length === 0) {
      const finalTaxValue =
        overallTax !== undefined && overallTax !== null
          ? overallTax
          : cartValue.totalTax || 0;
      if (finalTaxValue > 0) {
        // Create a generic tax breakdown based on the tax type (inter vs intra)
        const taxName = isInter ? "IGST" : "CGST + SGST";
        breakup.push({
          name: taxName,
          value: finalTaxValue,
        });
      }
    }

    return breakup;
  }, [products, isInter, cartValue, overallTax, precision]);

  // Use API values when available, otherwise use calculated values
  const finalShipping =
    overallShipping !== undefined && overallShipping !== null
      ? overallShipping
      : cartValue.totalShipping || 0;
  const finalTax =
    overallTax !== undefined && overallTax !== null
      ? overallTax
      : cartValue.totalTax || 0;

  // Total should use calculatedTotal (exact value) not grandTotal (which may be rounded)
  // This ensures we show the precise amount like INR ₹33.99 instead of rounded INR ₹34.00
  const finalTotal =
    calculatedTotal !== undefined && calculatedTotal !== null
      ? calculatedTotal
      : cartValue.calculatedTotal || cartValue.grandTotal || 0;

  const finalSubtotal =
    subTotal !== undefined && subTotal !== null
      ? subTotal
      : cartValue.totalValue || 0;
  const finalTaxableAmount =
    taxableAmount !== undefined && taxableAmount !== null
      ? taxableAmount
      : cartValue.taxableAmount || 0;

  // Calculate discount (basic discount or cash discount)
  // Total discount is the sum of both basic and cash discount, or just basic if cash doesn't exist
  const discount =
    (cartValue.totalBasicDiscount || 0) + (cartValue.totalCashDiscount || 0);

  // Show fields conditionally
  const showListPrice = !cartValue.hideListPricePublic && cartValue.totalLP > 0;
  const showDiscount = discount > 0;
  const showShippingCharges = finalShipping > 0;
  const showPfRate = cartValue.pfRate > 0;

  return (
    <Card className="shadow-sm bg-white p-0 m-0 overflow-hidden gap-4 w-full">
      <CardHeader className="px-4 py-2 bg-green-100 rounded-t-lg m-0 p-0 space-y-0">
        <CardTitle className="text-lg font-semibold text-gray-800 py-2 px-4">
          {t("priceDetails")}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 space-y-3 pt-0 pb-4 overflow-x-auto">
        {/* Total Items */}
        {cartValue.totalItems > 0 && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <TypographyMuted>{t("totalItems")}</TypographyMuted>
            </div>
            <div className="text-right flex-shrink-0">
              <TypographyMuted>{cartValue.totalItems}</TypographyMuted>
            </div>
          </div>
        )}

        {/* Total LP - only show if list price should be shown */}
        {showListPrice && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <TypographyMuted>{t("totalLP")}</TypographyMuted>
            </div>
            <div className="text-right flex-shrink-0 break-words">
              <TypographyMuted>
                <PricingFormat value={cartValue.totalLP || 0} />
              </TypographyMuted>
            </div>
          </div>
        )}

        {/* Discount - only show if there's a discount */}
        {showDiscount && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <h5 className="text-sm font-normal text-green-600">
                {t("discountLabel")}
              </h5>
            </div>
            <div className="text-right flex-shrink-0 break-words">
              <h5 className="text-sm font-normal text-green-600">
                -<PricingFormat value={discount} />
              </h5>
            </div>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <h6 className="text-sm font-semibold text-gray-800">
              {t("subtotal")}
            </h6>
          </div>
          <div className="text-right flex-shrink-0 break-words">
            <h6 className="text-sm font-semibold text-gray-800">
              <PricingFormat value={finalSubtotal} />
            </h6>
          </div>
        </div>

        {/* P&F Rate - show if exists */}
        {showPfRate && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <TypographyMuted>{t("pfRate")}</TypographyMuted>
            </div>
            <div className="text-right flex-shrink-0 break-words">
              <TypographyMuted>
                <PricingFormat value={cartValue.pfRate || 0} />
              </TypographyMuted>
            </div>
          </div>
        )}

        <Separator />

        {/* Taxable Amount - always show if exists */}
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <h6 className="text-sm font-semibold text-gray-800">
              {t("taxableAmount")}
            </h6>
          </div>
          <div className="text-right flex-shrink-0 break-words">
            <h6 className="text-sm font-semibold text-gray-800">
              <PricingFormat value={finalTaxableAmount} />
            </h6>
          </div>
        </div>

        {/* Tax + expand button */}
        {finalTax !== undefined && finalTax !== null && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex items-center gap-1 flex-shrink-0">
              <TypographyMuted>{t("tax")}</TypographyMuted>
              {taxBreakup.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 flex-shrink-0"
                  onClick={() => setTaxExpanded(!taxExpanded)}
                  aria-expanded={taxExpanded}
                  aria-label="show more"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      taxExpanded ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              )}
            </div>
            <div className="text-right flex-shrink-0 break-words">
              <TypographyMuted>
                <PricingFormat value={finalTax} />
              </TypographyMuted>
            </div>
          </div>
        )}

        {/* Collapsible Tax Breakdown */}
        {taxExpanded && taxBreakup.length > 0 && (
          <div className="ml-4 mt-2 space-y-1">
            {taxBreakup.map(taxDetail => (
              <div
                key={taxDetail.name}
                className="flex justify-between items-center gap-4 min-w-0"
              >
                <TypographyMuted className="flex-shrink-0">
                  {taxDetail.name}
                </TypographyMuted>
                <div className="text-right flex-shrink-0 break-words">
                  <TypographyMuted>
                    <PricingFormat value={taxDetail.value} />
                  </TypographyMuted>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shipping Charges */}
        {showShippingCharges && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <TypographyMuted>Shipping Charges</TypographyMuted>
            </div>
            <div className="text-right flex-shrink-0 break-words">
              <TypographyMuted>
                <PricingFormat value={finalShipping} />
              </TypographyMuted>
            </div>
          </div>
        )}

        {/* Insurance Charges */}
        {insuranceCharges > 0 && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <TypographyMuted>Insurance Charges</TypographyMuted>
            </div>
            <div className="text-right flex-shrink-0 break-words">
              <TypographyMuted>
                <PricingFormat value={insuranceCharges} />
              </TypographyMuted>
            </div>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <h4 className="text-lg font-bold text-gray-800">{t("total")}</h4>
          </div>
          <div className="text-right flex-shrink-0 break-words">
            <h4 className="text-lg font-bold text-gray-800">
              <PricingFormat value={finalTotal} />
            </h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
