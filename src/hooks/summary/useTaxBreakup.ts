"use client";

import { useEffect, useState, useMemo } from "react";
import { useCalculation } from "@/hooks/useCalculation/useCalculation";
import { calculateShippingTax } from "@/utils/calculation/tax-breakdown";
import { setTaxBreakup } from "@/utils/calculation/tax-breakdown";

/**
 * Hook to calculate tax breakup for summary pages
 * Migrated from buyer-fe/src/components/Summary/hooks/useTaxBreakup.js
 * 
 * @param products - Array of products
 * @param setBillingAddress - Billing address object
 * @param warehouse - Warehouse address object
 * @param overallShipping - Overall shipping charges
 * @param isBeforeTax - Whether shipping is before tax
 * @param beforeTaxPercentage - Before tax percentage
 * @param preference - Preference object with insurance details
 * @param quoteSettings - Quote settings object
 * @returns Tax breakup data with cart details, product details, and breakup
 */
export default function useTaxBreakup(
  products: any[] = [],
  setBillingAddress: any,
  warehouse: any = {},
  overallShipping: number = 0,
  isBeforeTax: boolean = false,
  beforeTaxPercentage: number = 0,
  preference: any,
  quoteSettings: any
) {
  const [data, setData] = useState<{
    cartDetails: any[];
    productDetails: any[];
    getBreakup: any[];
    isInter: boolean;
  }>({
    cartDetails: [],
    productDetails: [],
    getBreakup: [],
    isInter: false,
  });
  const [dataInserted, setDataInserted] = useState(false);
  
  const { globalCalc } = useCalculation();

  // Determine if inter-state or intra-state
  const isInter = useMemo(() => {
    if (!setBillingAddress?.state || !warehouse?.addressId?.state) {
      return false;
    }
    return setBillingAddress.state !== warehouse.addressId.state;
  }, [setBillingAddress?.state, warehouse?.addressId?.state]);

  // Calculate tax details
  useEffect(() => {
    if (
      !dataInserted &&
      products?.length > 0 &&
      warehouse &&
      setBillingAddress
    ) {
      try {
        // Use globalCalc to get initial cart value and products
        const calcResult = globalCalc({
          products,
          isInter,
          taxExemption: false,
          insuranceCharges: quoteSettings?.showInsuranceCharges
            ? preference?.insuranceId?.insuranceValue || 0
            : 0,
          precision: 2,
          Settings: quoteSettings || {},
          isSeller: false,
          overallShipping,
          isBeforeTax,
        });

        // Get tax breakup
        const breakup = setTaxBreakup(calcResult.products, isInter);

        // Calculate shipping tax if needed
        let finalResult = calcResult;
        if (breakup.length > 0) {
          const shippingTaxResult = calculateShippingTax(
            overallShipping || 0,
            calcResult.cartValue,
            calcResult.products,
            isBeforeTax,
            isInter,
            2, // roundOff
            quoteSettings?.itemWiseShippingTax || false
          );
          finalResult = shippingTaxResult;
        }

        setData({
          cartDetails: [finalResult.cartValue],
          productDetails: finalResult.products,
          getBreakup: finalResult.breakup || breakup,
          isInter,
        });
        setDataInserted(true);
      } catch (error) {
        console.error("Error calculating tax breakup:", error);
        setData({
          cartDetails: [],
          productDetails: products,
          getBreakup: [],
          isInter,
        });
        setDataInserted(true);
      }
    }
  }, [
    products,
    warehouse,
    setBillingAddress,
    dataInserted,
    preference,
    overallShipping,
    isBeforeTax,
    beforeTaxPercentage,
    quoteSettings,
    isInter,
    globalCalc,
  ]);

  return {
    cartDetails: data?.cartDetails,
    productDetails: data?.productDetails,
    getBreakup: data?.getBreakup,
    isInter: data?.isInter,
  };
}

