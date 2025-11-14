// Mocks for tax-calculation utilities
// These mocks are for testing the utilities in isolation.

import type { CartItem } from "@/types/calculation/cart";
import type { TaxReq } from "@/types/calculation/tax";

export const mockCartItem: CartItem = {
  productId: "prod-1",
  quantity: 10,
  askedQuantity: 10,
  unitPrice: 100,
  totalPrice: 1000,
  pfRate: 50,
  tax: 0,
  totalTax: 0,
} as CartItem;

export const mockCartItemWithInterTax: CartItem = {
  ...mockCartItem,
  hsnDetails: {
    interTax: {
      totalTax: 10,
      taxReqLs: [
        {
          taxName: "GST",
          rate: 10,
          compound: false,
        },
      ] as TaxReq[],
    },
  },
} as CartItem;

export const mockCartItemWithIntraTax: CartItem = {
  ...mockCartItem,
  hsnDetails: {
    intraTax: {
      totalTax: 8,
      taxReqLs: [
        {
          taxName: "GST",
          rate: 8,
          compound: false,
        },
      ] as TaxReq[],
    },
  },
} as CartItem;

export const mockCartItemWithCompoundTax: CartItem = {
  ...mockCartItem,
  hsnDetails: {
    interTax: {
      totalTax: 12,
      taxReqLs: [
        {
          taxName: "GST",
          rate: 10,
          compound: false,
        },
        {
          taxName: "CESS",
          rate: 2,
          compound: true,
        },
      ] as TaxReq[],
    },
  },
} as CartItem;

export const mockCartItemWithMultipleTaxes: CartItem = {
  ...mockCartItem,
  hsnDetails: {
    interTax: {
      totalTax: 18,
      taxReqLs: [
        {
          taxName: "CGST",
          rate: 9,
          compound: false,
        },
        {
          taxName: "SGST",
          rate: 9,
          compound: false,
        },
      ] as TaxReq[],
    },
  },
} as CartItem;

export const mockCartItemWithBothTaxes: CartItem = {
  ...mockCartItem,
  hsnDetails: {
    interTax: {
      totalTax: 10,
      taxReqLs: [
        {
          taxName: "IGST",
          rate: 10,
          compound: false,
        },
      ] as TaxReq[],
    },
    intraTax: {
      totalTax: 8,
      taxReqLs: [
        {
          taxName: "CGST",
          rate: 4,
          compound: false,
        },
        {
          taxName: "SGST",
          rate: 4,
          compound: false,
        },
      ] as TaxReq[],
    },
  },
} as CartItem;

export const mockCartItemWithExistingBreakup: CartItem = {
  ...mockCartItem,
  interTaxBreakup: [
    {
      taxName: "GST",
      taxPercentage: 10,
      compound: false,
    },
  ],
  hsnDetails: {
    interTax: {
      totalTax: 10,
    },
  },
} as CartItem;

export const mockCartItemWithoutHsnDetails: CartItem = {
  ...mockCartItem,
  hsnDetails: undefined,
} as unknown as CartItem;

export const mockCartItemWithZeroTax: CartItem = {
  ...mockCartItem,
  hsnDetails: {
    interTax: {
      totalTax: 0,
      taxReqLs: [],
    },
  },
} as CartItem;

export const mockCartItemWithoutPfRate: CartItem = {
  ...mockCartItem,
  pfRate: undefined,
  hsnDetails: {
    interTax: {
      totalTax: 10,
      taxReqLs: [
        {
          taxName: "GST",
          rate: 10,
          compound: false,
        },
      ] as TaxReq[],
    },
  },
} as unknown as CartItem;
