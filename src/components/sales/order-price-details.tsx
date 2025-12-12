"use client";

import SectionCardDetail from "@/components/custom/SectionCardDetail";
import { Button } from "@/components/ui/button";
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
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import PricingFormat from "../PricingFormat";
import { Skeleton } from "../ui/skeleton";

interface TaxDetail {
  name: string;
  value: number;
}

interface TaxBreakupItem {
  taxName: string;
  [key: string]: unknown;
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
  // Cash discount values from cartValue - use these when available
  totalCashDiscount?: number;
  cashDiscountValue?: number;
  // Hide P&F Rate for quote summary pages
  hidePfRate?: boolean;
  // Volume Discount props
  VolumeDiscountAvailable?: boolean;
  VDapplied?: boolean;
  VDDetails?: {
    subTotal?: number;
    subTotalVolume?: number;
    volumeDiscountApplied?: number;
    overallTax?: number;
    taxableAmount?: number;
    grandTotal?: number;
    calculatedTotal?: number;
    roundingAdjustment?: number;
  };
  // Already Paid
  alreadyPaid?: number;
  // Rounding Adjustment
  roundingAdjustment?: number;
  // Tax breakdown from API
  getBreakup?: TaxBreakupItem[];
  // Before Tax settings
  isBeforeTax?: boolean;
  beforeTaxPercentage?: number;
  // Shipping Tax (calculated)
  isCart?: boolean;
  shippingTax?: number;
  loading?: boolean;
  totalBasicDiscount?: number;
  // Header color prop
  headerColor?:
    | "default"
    | "muted"
    | "accent"
    | "primary"
    | "secondary"
    | "green";
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
  totalBasicDiscount,
  totalCashDiscount: propTotalCashDiscount,
  cashDiscountValue: propCashDiscountValue,
  hidePfRate = false,
  VolumeDiscountAvailable = false,
  VDapplied = false,
  VDDetails = {},
  alreadyPaid,
  roundingAdjustment: _roundingAdjustment,
  getBreakup = [],
  isBeforeTax = false,
  shippingTax = 0,
  isCart = false,
  loading,
  headerColor = "green",
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
      let totalCashDiscountFromProducts = 0;
      let cashDiscountValueFromProducts = 0;

      // Use cash discount values from props if available (from cartValue), otherwise calculate from products
      if (
        propTotalCashDiscount !== undefined &&
        propTotalCashDiscount !== null
      ) {
        totalCashDiscountFromProducts = propTotalCashDiscount;
      }
      if (
        propCashDiscountValue !== undefined &&
        propCashDiscountValue !== null
      ) {
        cashDiscountValueFromProducts = propCashDiscountValue;
      }

      if (products && products.length > 0) {
        products.forEach((product: any) => {
          pfRateFromProducts += product.pfRate || 0;
          totalLPFromProducts +=
            (product.unitListPrice || product.unitLP || 0) *
            (product.quantity || product.askedQuantity || 1);

          // Calculate cash discount if applicable (only if not provided via props)
          // Cash discount is calculated on the price AFTER basic discount (originalUnitPrice), not on list price
          if (
            propTotalCashDiscount === undefined ||
            propTotalCashDiscount === null
          ) {
            const productCashDiscountValue =
              product.cashdiscountValue || product.cashDiscountValue || 0;
            if (productCashDiscountValue > 0) {
              // Extract cash discount value (percentage)
              if (!cashDiscountValueFromProducts) {
                cashDiscountValueFromProducts = productCashDiscountValue;
              }
              // Calculate cash discount amount based on originalUnitPrice (price after basic discount)
              // This matches the calculation in cart-calculation.ts
              const qty = product.quantity || product.askedQuantity || 1;
              // Use originalUnitPrice (price after basic discount) or unitPrice as fallback
              const basePriceForCashDiscount =
                product.originalUnitPrice || product.unitPrice || 0;
              // Cash discount = (originalUnitPrice * cashdiscountValue) / 100 * quantity
              const cashDiscountAmount =
                (basePriceForCashDiscount * productCashDiscountValue) / 100;
              totalCashDiscountFromProducts += cashDiscountAmount * qty;
            }
          }

          // Calculate basic discount (difference between list price and original unit price before cash discount)
          // Basic discount = listPrice - originalUnitPrice (or unitPrice if no cash discount)
          const qty = product.quantity || product.askedQuantity || 1;
          const listPrice = product.unitListPrice || product.unitLP || 0;
          const originalPriceForBasicDiscount =
            product.originalUnitPrice ||
            product.unitPrice ||
            product.discountedPrice ||
            0;

          if (listPrice > originalPriceForBasicDiscount && isCart === false) {
            const basicDiscountAmount =
              listPrice - originalPriceForBasicDiscount;
            totalBasicDiscountFromProducts += basicDiscountAmount * qty;
          } else {
            totalBasicDiscountFromProducts = totalBasicDiscount || 0;
          }
        });
      }

      // If we can't calculate pfRate from products, derive it from taxableAmount and subTotal
      // But only if hidePfRate is false (for orders, not quotes)
      const calculatedPfRate = hidePfRate
        ? 0 // Don't calculate P&F Rate for quotes
        : pfRateFromProducts > 0
          ? pfRateFromProducts
          : taxableAmount -
            subTotal -
            (overallShipping !== undefined && overallShipping !== null
              ? overallShipping
              : 0);

      // Note: Cash discount is already calculated correctly in the loop above (lines 144-166)
      // based on unitListPrice (list price), which matches the calculation in cart-calculation.ts.
      // The duplicate calculation using unitPrice (discounted price) was incorrect and has been removed.

      return {
        totalItems: products?.length || 0,
        totalLP: totalLPFromProducts,
        totalBasicDiscount: totalBasicDiscountFromProducts,
        totalCashDiscount: totalCashDiscountFromProducts,
        cashDiscountValue: cashDiscountValueFromProducts,
        totalValue: subTotal,
        totalTax: overallTax,
        totalShipping: overallShipping !== undefined ? overallShipping : 0,
        pfRate: hidePfRate ? 0 : calculatedPfRate > 0 ? calculatedPfRate : 0,
        taxableAmount,
        grandTotal: calculatedTotal,
        hideListPricePublic: totalLPFromProducts === 0,
        insuranceCharges: insuranceCharges || 0, // Include insuranceCharges in cartValue
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
        insuranceCharges: insuranceCharges || 0,
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
    hidePfRate,
    propCashDiscountValue,
    propTotalCashDiscount,
    isCart,
    totalBasicDiscount,
  ]);

  // Extract tax breakdown from getBreakup prop or calculate from cartValue
  const taxBreakup = useMemo(() => {
    const breakup: TaxDetail[] = [];

    // First, try to use getBreakup prop if provided
    if (getBreakup && getBreakup.length > 0) {
      getBreakup.forEach(breakupItem => {
        const taxName = breakupItem.taxName || "";
        if (taxName) {
          // Get tax total from cartValue using the tax name
          const taxValue = cartValue[`${taxName}Total`] || 0;
          if (taxValue > 0) {
            breakup.push({
              name: taxName,
              value: taxValue,
            });
          }
        }
      });

      // Add shipping tax if applicable
      if (shippingTax > 0 && !Settings?.itemWiseShippingTax && isBeforeTax) {
        breakup.push({
          name: "Shipping Tax",
          value: shippingTax,
        });
      }

      return breakup;
    }

    // Fallback: Try to use pre-calculated tax totals from cartValue
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
        key !== "totalCashDiscount" &&
        key !== "shippingTax"
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

      // Add shipping tax if applicable
      if (
        cartValue.shippingTax > 0 &&
        !Settings?.itemWiseShippingTax &&
        isBeforeTax
      ) {
        breakup.push({
          name: "Shipping Tax",
          value: cartValue.shippingTax,
        });
      }

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

        // Add shipping tax if applicable
        if (shippingTax > 0 && !Settings?.itemWiseShippingTax && isBeforeTax) {
          breakup.push({
            name: "Shipping Tax",
            value: shippingTax,
          });
        }

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
  }, [
    products,
    isInter,
    cartValue,
    overallTax,
    precision,
    getBreakup,
    shippingTax,
    isBeforeTax,
    Settings,
  ]);

  // Use API values when available, otherwise use calculated values
  const finalShipping =
    overallShipping !== undefined && overallShipping !== null
      ? overallShipping
      : cartValue.totalShipping || 0;
  // For tax, prefer overallTax if provided, otherwise use cartValue.totalTax
  // If both are 0 or undefined, calculate from products as fallback
  const finalTax =
    overallTax !== undefined && overallTax !== null
      ? overallTax
      : cartValue.totalTax !== undefined && cartValue.totalTax !== null
        ? cartValue.totalTax
        : 0;

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

  const cashDiscountValue = cartValue.cashDiscountValue || 0;
  const showShippingCharges = finalShipping > 0;

  // Calculate Taxable Amount exactly as buyer-fe: pfRate + (VDapplied ? VDDetails?.subTotalVolume : cartValue?.totalValue) + (isBeforeTax ? cartValue?.totalShipping : 0)
  const finalTaxableAmount =
    taxableAmount !== undefined && taxableAmount !== null
      ? taxableAmount
      : cartValue.pfRate +
        (VDapplied
          ? VDDetails?.subTotalVolume || 0
          : cartValue?.totalValue || 0) +
        (isBeforeTax ? cartValue?.totalShipping || 0 : 0);

  // Calculate discounts separately (basic discount and cash discount)
  const basicDiscount = cartValue.totalBasicDiscount || 0;
  const cashDiscount = cartValue.totalCashDiscount || 0;

  // Show fields conditionally

  const showBasicDiscount = basicDiscount > 0;
  // Hide P&F Rate if hidePfRate prop is true (for quote summary pages)
  const showPfRate = !hidePfRate && cartValue.pfRate > 0;
  // Calculate discount exactly as buyer-fe
  // DISCOUNT = isNumber(cartValue?.totalBasicDiscount) ? cartValue?.totalBasicDiscount : cartValue?.totalLP - cartValue?.totalValue
  // When VD applied: cartValue?.totalLP - VDDetails?.subTotal
  // Note: DISCOUNT calculation removed as it's not currently used in the UI
  // If needed in future, calculate as:
  // const DISCOUNT = VolumeDiscountAvailable && VDapplied
  //   ? cartValue.totalLP - (VDDetails?.subTotal || 0)
  //   : cartValue.totalBasicDiscount !== undefined && cartValue.totalBasicDiscount !== null
  //     ? cartValue.totalBasicDiscount
  //     : cartValue.totalLP - cartValue.totalValue;

  const CASH_DISCOUNT = cartValue.totalCashDiscount || 0;

  // Show fields conditionally
  const showListPrice = !cartValue.hideListPricePublic && cartValue.totalLP > 0;

  const showCashDiscount = Boolean(CASH_DISCOUNT > 0);

  return (
    <SectionCardDetail
      title={t("priceDetails")}
      headerColor={headerColor}
      shadow="sm"
      contentClassName="px-6 space-y-3 pt-2 pb-4 overflow-x-auto"
    >
      {/* Total Items */}
      {loading ? (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <p className="text-sm font-normal text-gray-900">
              {t("totalItems")}
            </p>
          </div>
          <div className="text-right flex-shrink-0 min-h-[20px]">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ) : (
        cartValue.totalItems > 0 && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <p className="text-sm font-normal text-gray-900">
                {t("totalItems")}
              </p>
            </div>
            <div className="text-right flex-shrink-0 min-h-[20px]">
              <p className="text-sm font-semibold text-gray-900">
                {cartValue.totalItems}
              </p>
            </div>
          </div>
        )
      )}

      {/* Total LP - only show if list price should be shown */}
      {loading ? (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <p className="text-sm font-normal text-gray-900">{t("totalLP")}</p>
          </div>
          <div className="text-right flex-shrink-0 min-h-[20px]">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ) : (
        showListPrice && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <p className="text-sm font-normal text-gray-900">
                {t("totalLP")}
              </p>
            </div>
            <div className="text-right flex-shrink-0 break-words min-h-[20px]">
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <p className="text-sm font-semibold text-gray-900">
                  <PricingFormat value={cartValue.totalLP || 0} />
                </p>
              )}
            </div>
          </div>
        )
      )}

      {/* Basic Discount - only show if there's a basic discount */}
      {showBasicDiscount && (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <h5 className="text-sm font-normal text-green-600">
              {t("discountLabel")}
            </h5>
          </div>
          <div className="text-right flex-shrink-0 break-words min-h-[20px]">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <h5 className="text-sm font-normal text-green-600">
                -<PricingFormat value={basicDiscount} />
              </h5>
            )}
          </div>
        </div>
      )}

      {showCashDiscount && (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <h5 className="text-sm font-normal text-green-600">
              {t("cashDiscount")}{" "}
              {cashDiscountValue > 0 ? `(${cashDiscountValue}%)` : ""}
            </h5>
          </div>
          <div className="text-right flex-shrink-0 break-words min-h-[20px]">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <h5 className="text-sm font-normal text-green-600">
                -<PricingFormat value={cashDiscount} />
              </h5>
            )}
          </div>
        </div>
      )}

      {/* Subtotal */}
      <div className="flex justify-between items-center gap-4 min-w-0">
        <div className="flex-shrink-0">
          <p className="text-sm font-normal text-gray-900">
            {VolumeDiscountAvailable && VDapplied
              ? t("subtotalExclVD") || "Subtotal (excl. VD)"
              : t("subtotal")}
          </p>
        </div>
        <div className="text-right flex-shrink-0 break-words min-h-[20px]">
          {loading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <p className="text-sm font-semibold text-gray-900">
              <PricingFormat
                value={VDapplied ? VDDetails?.subTotal || 0 : finalSubtotal}
              />
            </p>
          )}
        </div>
      </div>

      {/* Volume Discount - show if applied */}
      {VolumeDiscountAvailable && VDapplied && (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <h5 className="text-sm font-normal text-green-600">
              {t("volumeDiscount") || "Volume Discount"}
            </h5>
          </div>
          <div className="text-right flex-shrink-0 break-words min-h-[20px]">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <h5 className="text-sm font-normal text-green-600">
                -<PricingFormat value={VDDetails?.volumeDiscountApplied || 0} />
              </h5>
            )}
          </div>
        </div>
      )}

      {/* Subtotal (after Volume Discount) */}
      {VolumeDiscountAvailable &&
        VDapplied &&
        VDDetails?.subTotalVolume &&
        VDDetails.subTotalVolume > 0 && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <p className="text-sm font-normal text-gray-900">
                {t("subtotal")}
              </p>
            </div>
            <div className="text-right flex-shrink-0 break-words min-h-[20px]">
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <p className="text-sm font-semibold text-gray-900">
                  <PricingFormat value={VDDetails.subTotalVolume} />
                </p>
              )}
            </div>
          </div>
        )}

      {/* P&F Rate - show if exists */}
      {showPfRate && (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <p className="text-sm font-normal text-gray-900">{t("pfRate")}</p>
          </div>
          <div className="text-right flex-shrink-0 break-words min-h-[20px]">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <p className="text-sm font-semibold text-gray-900">
                <PricingFormat value={cartValue.pfRate || 0} />
              </p>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Shipping Charges - show before Taxable Amount if isBeforeTax */}
      {isBeforeTax && showShippingCharges && (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <p className="text-sm font-normal text-gray-900">
              Shipping Charges
            </p>
          </div>
          <div className="text-right flex-shrink-0 break-words min-h-[20px]">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <p className="text-sm font-semibold text-gray-900">
                <PricingFormat value={finalShipping} />
              </p>
            )}
          </div>
        </div>
      )}

      {/* Taxable Amount - always show if exists */}
      <div className="flex justify-between items-center gap-4 min-w-0">
        <div className="flex-shrink-0">
          <p className="text-sm font-normal text-gray-900">
            {t("taxableAmount")}
          </p>
        </div>
        <div className="text-right flex-shrink-0 break-words min-h-[20px]">
          {loading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <p className="text-sm font-semibold text-gray-900">
              <PricingFormat
                value={
                  VDapplied && VDDetails?.taxableAmount !== undefined
                    ? VDDetails.taxableAmount
                    : finalTaxableAmount
                }
              />
            </p>
          )}
        </div>
      </div>

      {/* Tax + expand button */}
      {finalTax !== undefined && finalTax !== null && (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex items-center gap-1 flex-shrink-0">
            <p className="text-sm font-normal text-gray-900">
              {taxExemption ? "N/A" : t("tax")}
            </p>
            {!taxExemption &&
              (taxBreakup.length > 0 ||
                (cartValue.shippingTax > 0 &&
                  !Settings?.itemWiseShippingTax &&
                  isBeforeTax)) && (
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
          <div className="text-right flex-shrink-0 break-words min-h-[20px]">
            {taxExemption ? (
              <p className="text-sm font-semibold text-gray-900">N/A</p>
            ) : loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <p className="text-sm font-semibold text-gray-900">
                <PricingFormat
                  value={
                    VDapplied && VDDetails?.overallTax !== undefined
                      ? VDDetails.overallTax
                      : finalTax
                  }
                />
              </p>
            )}
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
              <p className="text-sm font-normal text-gray-900 flex-shrink-0">
                {taxDetail.name}
              </p>
              <div className="text-right flex-shrink-0 break-words min-h-[20px]">
                {loading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    <PricingFormat value={taxDetail.value} />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shipping Charges - show after Tax if !isBeforeTax */}
      {!isBeforeTax && showShippingCharges && (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <p className="text-sm font-normal text-gray-900">
              Shipping Charges
            </p>
          </div>
          <div className="text-right flex-shrink-0 break-words min-h-[20px]">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <p className="text-sm font-semibold text-gray-900">
                <PricingFormat value={finalShipping} />
              </p>
            )}
          </div>
        </div>
      )}

      {/* Insurance Charges - match buyer-fe: Boolean(!isCart && cartValue.insuranceCharges > 0) */}
      {/* Check both cartValue.insuranceCharges and insuranceCharges prop */}
      {Boolean((cartValue?.insuranceCharges ?? insuranceCharges ?? 0) > 0) && (
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <TypographyMuted>Insurance Charges</TypographyMuted>
          </div>
          <div className="text-right flex-shrink-0 break-words min-h-[20px]">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <TypographyMuted>
                <PricingFormat
                  value={cartValue?.insuranceCharges ?? insuranceCharges ?? 0}
                />
              </TypographyMuted>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Already Paid Section */}
      {alreadyPaid !== undefined && alreadyPaid !== null && alreadyPaid > 0 && (
        <>
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <h4 className="text-lg font-bold text-gray-800">
                {t("total").replace(":", "")}
              </h4>
            </div>
            <div className="text-right flex-shrink-0 break-words min-h-[28px]">
              {loading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <h4 className="text-lg font-bold text-gray-800">
                  <PricingFormat
                    value={
                      (VDapplied ? VDDetails?.grandTotal : finalTotal) +
                      alreadyPaid
                    }
                  />
                </h4>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <TypographyMuted className="text-red-600">
                {t("alreadyPaid") || "Already Paid"}
              </TypographyMuted>
            </div>
            <div className="text-right flex-shrink-0 break-words min-h-[20px]">
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <TypographyMuted className="text-red-600">
                  -<PricingFormat value={alreadyPaid} />
                </TypographyMuted>
              )}
            </div>
          </div>
        </>
      )}

      {/* Total / To Pay */}
      <div className="flex justify-between items-center gap-4 min-w-0 pt-2">
        <div className="flex-shrink-0">
          <h4 className="text-lg font-bold text-gray-800">
            {alreadyPaid !== undefined &&
            alreadyPaid !== null &&
            alreadyPaid > 0
              ? t("toPay") || "To Pay"
              : t("total").replace(":", "")}
          </h4>
        </div>
        <div className="text-right flex-shrink-0 break-words min-h-[28px]">
          {loading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <h4 className="text-lg font-bold text-gray-800">
              <PricingFormat
                value={
                  VDapplied && VDDetails?.grandTotal !== undefined
                    ? VDDetails.grandTotal
                    : finalTotal
                }
              />
            </h4>
          )}
        </div>
      </div>
    </SectionCardDetail>
  );
}
