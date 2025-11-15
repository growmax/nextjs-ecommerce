import each from "lodash/each";

import type { CartItem, CartValue } from "@/types/calculation/cart";
import type { TaxBreakup } from "@/types/calculation/tax";

export interface TaxCalculationParams {
  isInter: boolean;
  precision: number;
}

export interface TaxCalculationResult {
  updatedItem: CartItem;
  updatedCartValue: CartValue;
}

export function calculateItemTaxes(
  item: CartItem,
  params: TaxCalculationParams
): TaxCalculationResult {
  const { isInter, precision } = params;

  // Clone item to avoid mutation
  const updatedItem: CartItem = { ...item };

  // Initialize tax breakups if they don't exist
  updatedItem.interTaxBreakup = updatedItem.interTaxBreakup || [];
  updatedItem.intraTaxBreakup = updatedItem.intraTaxBreakup || [];

  // Build tax breakups from HSN details
  if (updatedItem.hsnDetails?.interTax?.taxReqLs) {
    each(updatedItem.hsnDetails.interTax.taxReqLs, taxes => {
      const tax: TaxBreakup = {
        taxName: taxes.taxName,
        taxPercentage: taxes.rate,
        compound: taxes.compound,
      };
      updatedItem.interTaxBreakup!.push(tax);
    });
  }

  if (updatedItem.hsnDetails?.intraTax?.taxReqLs) {
    each(updatedItem.hsnDetails.intraTax.taxReqLs, taxes => {
      const tax: TaxBreakup = {
        taxName: taxes.taxName,
        taxPercentage: taxes.rate,
        compound: taxes.compound,
      };
      updatedItem.intraTaxBreakup!.push(tax);
    });
  }

  const cartValueUpdates: Partial<CartValue> = {};

  if (isInter) {
    // Inter-state tax calculation
    updatedItem.tax = updatedItem.hsnDetails?.interTax?.totalTax || 0;
    let intraTotalTax = 0;

    if (updatedItem.interTaxBreakup?.length) {
      each(updatedItem.interTaxBreakup, inter => {
        updatedItem[inter.taxName as keyof CartItem] = inter.taxPercentage;

        if (!inter.compound) {
          const taxValue = round(
            ((updatedItem.totalPrice! + (updatedItem.pfRate || 0)) *
              inter.taxPercentage) /
              100,
            precision
          );
          updatedItem[`${inter.taxName}Value` as keyof CartItem] = taxValue;
          intraTotalTax += taxValue as number;
        } else {
          const taxValue = round(
            (intraTotalTax * inter.taxPercentage) / 100,
            precision
          );
          updatedItem[`${inter.taxName}Value` as keyof CartItem] = taxValue;
          intraTotalTax += taxValue as number;
        }

        const taxTotalKey = `${inter.taxName}Total` as keyof CartValue;
        cartValueUpdates[taxTotalKey] =
          ((cartValueUpdates[taxTotalKey] as number) || 0) +
          (updatedItem[`${inter.taxName}Value` as keyof CartItem] as number);
      });

      updatedItem.totalTax = intraTotalTax;
    } else {
      updatedItem.totalTax = 0;
    }
  } else {
    // Intra-state tax calculation
    updatedItem.tax = updatedItem.hsnDetails?.intraTax?.totalTax || 0;
    let interTotalTax = 0;

    if (updatedItem.intraTaxBreakup?.length) {
      each(updatedItem.intraTaxBreakup, intra => {
        updatedItem[intra.taxName as keyof CartItem] = intra.taxPercentage;

        if (!intra.compound) {
          const taxValue = round(
            ((updatedItem.totalPrice! + (updatedItem.pfRate || 0)) *
              intra.taxPercentage) /
              100,
            precision
          );
          updatedItem[`${intra.taxName}Value` as keyof CartItem] = taxValue;
          interTotalTax += taxValue as number;
        } else {
          const taxValue = round(
            (interTotalTax * intra.taxPercentage) / 100,
            precision
          );
          updatedItem[`${intra.taxName}Value` as keyof CartItem] = taxValue;
          interTotalTax += taxValue as number;
        }

        const taxTotalKey = `${intra.taxName}Total` as keyof CartValue;
        cartValueUpdates[taxTotalKey] =
          ((cartValueUpdates[taxTotalKey] as number) || 0) +
          (updatedItem[`${intra.taxName}Value` as keyof CartItem] as number);
      });

      updatedItem.totalTax = interTotalTax;
    } else {
      updatedItem.totalTax = 0;
    }
  }

  // Calculate product tax
  updatedItem.prodTax = round(
    ((updatedItem.totalPrice! + (updatedItem.pfRate || 0)) *
      (updatedItem.tax || 0)) /
      100,
    precision
  );

  return {
    updatedItem,
    updatedCartValue: cartValueUpdates as CartValue,
  };
}

function round(value: number, precision: number): number {
  return parseFloat(value.toFixed(precision));
}
