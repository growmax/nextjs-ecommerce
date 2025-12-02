/**
 * Mock data and utilities for TargetDiscountCard component tests
 */

import { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

// Mock form values
export const mockFormValues = {
  sprDetails: {
    targetPrice: 0,
    sprRequestedDiscount: 0,
    spr: false,
  },
  cartValue: {
    totalValue: 1000,
    taxableAmount: 1000,
    totalTax: 0,
    grandTotal: 1000,
    calculatedTotal: 1000,
    cashDiscountValue: 0,
  },
  products: [
    {
      productId: 1,
      brandProductId: "PROD-1",
      itemCode: "ITEM-1",
      productName: "Test Product 1",
      unitPrice: 500,
      quantity: 1,
      askedQuantity: 1,
      unitQuantity: 1,
      totalPrice: 500,
      showPrice: true,
      priceNotAvailable: false,
      cashdiscountValue: 0,
      interTaxBreakup: [],
      intraTaxBreakup: [],
      totalTax: 0,
      hsnDetails: {},
      bundleProducts: [],
    },
    {
      productId: 2,
      brandProductId: "PROD-2",
      itemCode: "ITEM-2",
      productName: "Test Product 2",
      unitPrice: 500,
      quantity: 1,
      askedQuantity: 1,
      unitQuantity: 1,
      totalPrice: 500,
      showPrice: true,
      priceNotAvailable: false,
      cashdiscountValue: 0,
      interTaxBreakup: [],
      intraTaxBreakup: [],
      totalTax: 0,
      hsnDetails: {},
      bundleProducts: [],
    },
  ],
  cashdiscount: false,
  isSPRRequested: false,
};

// Mock company data
export const mockCompanyData = {
  roundOff: 2,
  userId: 1,
  companyId: 1,
  companyName: "Test Company",
};

// Mock quote settings
export const mockQuoteSettings = {
  spr: true,
  roundingAdjustment: false,
  showCashDiscount: true,
  quoteValidity: 30,
};

// Mock form errors
export const mockFormErrors = {
  sprDetails: {
    sprRequestedDiscount: {
      message: "Discount must be between 0 and 100",
    },
    targetPrice: {
      message: "Target price must be greater than 0",
    },
  },
};

// Helper to create form wrapper for tests
export function createFormWrapper(defaultValues: any = mockFormValues) {
  return function FormWrapper({ children }: { children: ReactNode }) {
    const methods = useForm({
      defaultValues,
      mode: "onChange",
    });

    return <FormProvider {...methods}>{children}</FormProvider>;
  };
}

// Mock products with different scenarios
export const mockProductsWithDiscount = [
  {
    ...mockFormValues.products[0],
    totalPrice: 400, // Discounted price
    unitPrice: 500,
  },
  {
    ...mockFormValues.products[1],
    totalPrice: 400, // Discounted price
    unitPrice: 500,
  },
];

export const mockProductsWithZeroPrice = [
  {
    ...mockFormValues.products[0],
    totalPrice: 0,
    unitPrice: 0,
  },
];

export const mockCartValueWithCashDiscount = {
  totalValue: 900, // After 10% cash discount
  taxableAmount: 900,
  totalTax: 0,
  grandTotal: 900,
  calculatedTotal: 900,
  cashDiscountValue: 10,
};

export const mockCartValueZero = {
  totalValue: 0,
  taxableAmount: 0,
  totalTax: 0,
  grandTotal: 0,
  calculatedTotal: 0,
  cashDiscountValue: 0,
};

