"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted } from "@/components/ui/typography";
import {
  cartCalculation,
  discountDetails,
} from "@/utils/calculation/cartCalculation";
import each from "lodash/each";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import PricingFormat from "../PricingFormat";

interface TaxDetail {
  name: string;
  value: number;
}

interface OrderPriceDetailsProps {
  products?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  isInter?: boolean;
  insuranceCharges?: number;
  precision?: number;
  Settings?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
  const [taxExpanded, setTaxExpanded] = useState(false);

  // Use calculated values from props if available, otherwise calculate
  const cartValue = useMemo(() => {
    // If calculated values are provided, use them directly
    // Check if calculatedTotal is explicitly provided (not undefined, even if 0)
    const hasCalculatedValues =
      calculatedTotal !== undefined &&
      subTotal !== undefined &&
      taxableAmount !== undefined;

    if (hasCalculatedValues) {
      return {
        totalItems: products?.length || 0,
        totalLP: 0,
        totalBasicDiscount: 0,
        totalCashDiscount: 0,
        totalValue: subTotal,
        totalTax: overallTax !== undefined ? overallTax : 0,
        totalShipping: overallShipping !== undefined ? overallShipping : 0,
        pfRate: 0,
        taxableAmount,
        grandTotal: calculatedTotal,
        hideListPricePublic: false,
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

  // Extract tax breakdown from processed products and cartValue
  const taxBreakup = useMemo(() => {
    const breakup: TaxDetail[] = [];

    if (!products || products.length === 0) {
      return breakup;
    }

    // Normalize products to ensure they have the expected structure
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

    // Preprocess products to get tax breakup structure
    const processedProducts = discountDetails(
      normalizedProducts,
      isSeller,
      taxExemption,
      precision
    );

    // Get unique tax names from processed products
    const taxNames = new Set<string>();

    // Collect tax names from processed products
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processedProducts.forEach((product: any) => {
      if (isInter && product.interTaxBreakup) {
        each(product.interTaxBreakup, tax => {
          taxNames.add(tax.taxName);
        });
      } else if (!isInter && product.intraTaxBreakup) {
        each(product.intraTaxBreakup, tax => {
          taxNames.add(tax.taxName);
        });
      }
    });

    // Build tax details array from cartValue totals
    taxNames.forEach(taxName => {
      const taxTotal = cartValue[`${taxName}Total`] as number;
      if (taxTotal && taxTotal > 0) {
        breakup.push({
          name: taxName,
          value: taxTotal || 0,
        });
      }
    });

    return breakup;
  }, [products, cartValue, isInter, isSeller, taxExemption, precision]);

  // Use API values when available, otherwise use calculated values
  const finalShipping =
    overallShipping !== undefined && overallShipping !== null
      ? overallShipping
      : cartValue.totalShipping || 0;
  const finalTax =
    overallTax !== undefined && overallTax !== null
      ? overallTax
      : cartValue.totalTax || 0;
  const finalTotal =
    calculatedTotal !== undefined && calculatedTotal !== null
      ? calculatedTotal
      : cartValue.grandTotal || 0;
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
    <Card className="shadow-sm bg-white p-0! m-0!">
      <CardHeader className="px-4 py-2 bg-green-100 rounded-t-lg">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Price Details
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-2 space-y-3 pt-0! pb-4">
        {/* Total Items */}
        {cartValue.totalItems > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <TypographyMuted>Total Items</TypographyMuted>
            </div>
            <div className="text-right">
              <TypographyMuted>{cartValue.totalItems}</TypographyMuted>
            </div>
          </div>
        )}

        {/* Total LP - only show if list price should be shown */}
        {showListPrice && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <TypographyMuted>Total LP</TypographyMuted>
            </div>
            <div className="text-right">
              <TypographyMuted>
                <PricingFormat value={cartValue.totalLP || 0} />
              </TypographyMuted>
            </div>
          </div>
        )}

        {/* Discount - only show if there's a discount */}
        {showDiscount && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h5 className="text-sm font-normal text-green-600">Discount</h5>
            </div>
            <div className="text-right">
              <h5 className="text-sm font-normal text-green-600">
                -<PricingFormat value={discount} />
              </h5>
            </div>
          </div>
        )}

        {/* Subtotal */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <h6 className="text-sm font-semibold text-gray-800">Subtotal</h6>
          </div>
          <div className="text-right">
            <h6 className="text-sm font-semibold text-gray-800">
              <PricingFormat value={finalSubtotal} />
            </h6>
          </div>
        </div>

        {/* P&F Rate - show if exists */}
        {showPfRate && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <TypographyMuted>P&F Rate</TypographyMuted>
            </div>
            <div className="text-right">
              <TypographyMuted>
                <PricingFormat value={cartValue.pfRate || 0} />
              </TypographyMuted>
            </div>
          </div>
        )}

        <Separator />

        {/* Taxable Amount - always show if exists */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <h6 className="text-sm font-semibold text-gray-800">
              Taxable Amount
            </h6>
          </div>
          <div className="text-right">
            <h6 className="text-sm font-semibold text-gray-800">
              <PricingFormat value={finalTaxableAmount} />
            </h6>
          </div>
        </div>

        {/* Tax + expand button */}
        {finalTax > 0 && (
          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="flex items-center gap-1">
              <TypographyMuted>Tax</TypographyMuted>
              {taxBreakup.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
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
            <div className="text-right">
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
              <div key={taxDetail.name} className="grid grid-cols-2 gap-2">
                <TypographyMuted>{taxDetail.name}</TypographyMuted>
                <div className="text-right">
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <TypographyMuted>Shipping Charges</TypographyMuted>
            </div>
            <div className="text-right">
              <TypographyMuted>
                <PricingFormat value={finalShipping} />
              </TypographyMuted>
            </div>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <h4 className="text-lg font-bold text-gray-800">Total</h4>
          </div>
          <div className="text-right">
            <h4 className="text-lg font-bold text-gray-800">
              <PricingFormat value={finalTotal} />
            </h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
