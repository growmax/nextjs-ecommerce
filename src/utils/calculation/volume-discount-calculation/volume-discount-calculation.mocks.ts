// Mocks for volume-discount-calculation utilities
// These mocks are for testing the utilities in isolation.

import type {
  CalculationSettings,
  CartItem,
  VolumeDiscountData,
} from "@/types/calculation/cart";
import type { VolumeDiscountItem } from "@/types/calculation/volume-discount";

export const mockCalculationSettings: CalculationSettings = {
  itemWiseShippingTax: false,
  roundingAdjustment: false,
};

export const mockCalculationSettingsWithItemWiseTax: CalculationSettings = {
  itemWiseShippingTax: true,
  roundingAdjustment: false,
};

export const mockCalculationSettingsWithRounding: CalculationSettings = {
  itemWiseShippingTax: false,
  roundingAdjustment: true,
};

export const mockCartItem: CartItem = {
  productId: "prod-1",
  itemNo: "item-1",
  quantity: 10,
  askedQuantity: 10,
  unitPrice: 100,
  totalPrice: 1000,
  unitListPrice: 100,
  pfItemValue: 5,
  tax: 10,
  shippingCharges: 50,
  productCost: 80,
  addonCost: 5,
} as CartItem;

export const mockCartItemWithInterTax: CartItem = {
  ...mockCartItem,
  hsnDetails: {
    interTax: {
      totalTax: 10,
    },
  },
  interTaxBreakup: [
    {
      taxName: "GST",
      taxPercentage: 10,
      compound: false,
    },
  ],
} as CartItem;

export const mockCartItemWithIntraTax: CartItem = {
  ...mockCartItem,
  hsnDetails: {
    intraTax: {
      totalTax: 8,
    },
  },
  intraTaxBreakup: [
    {
      taxName: "GST",
      taxPercentage: 8,
      compound: false,
    },
  ],
} as CartItem;

export const mockCartItemWithCompoundTax: CartItem = {
  ...mockCartItem,
  itemNo: "item-2",
  hsnDetails: {
    interTax: {
      totalTax: 12,
    },
  },
  interTaxBreakup: [
    {
      taxName: "GST",
      taxPercentage: 10,
      compound: false,
    },
    {
      taxName: "CESS",
      taxPercentage: 2,
      compound: true,
    },
  ],
} as CartItem;

export const mockVolumeDiscountData: VolumeDiscountData[] = [
  {
    itemNo: "item-1",
    volumeDiscount: 10,
    appliedDiscount: 10,
  },
];

export const mockVolumeDiscountDataMultiple: VolumeDiscountData[] = [
  {
    itemNo: "item-1",
    volumeDiscount: 10,
    appliedDiscount: 10,
  },
  {
    itemNo: "item-2",
    volumeDiscount: 15,
    appliedDiscount: 15,
  },
];

export const mockVolumeDiscountItem: VolumeDiscountItem = {
  productId: "prod-1",
  unitListPrice: 100,
  askedQuantity: 10,
  pfItemValue: 5,
  discount: 0,
  tax: 10,
  shippingCharges: 50,
  productCost: 80,
  addonCost: 5,
  volume_discount_obj: {
    DiscountId: "vd-1",
    Percentage: 10,
  },
  CantCombineWithOtherDisCounts: false,
} as VolumeDiscountItem;

export const mockVolumeDiscountItemWithInterTax: VolumeDiscountItem = {
  ...mockVolumeDiscountItem,
  hsnDetails: {
    interTax: {
      totalTax: 10,
    },
  },
  interTaxBreakup: [
    {
      taxName: "GST",
      taxPercentage: 10,
      compound: false,
    },
  ],
} as VolumeDiscountItem;

export const mockVolumeDiscountItemWithIntraTax: VolumeDiscountItem = {
  ...mockVolumeDiscountItem,
  hsnDetails: {
    intraTax: {
      totalTax: 8,
    },
  },
  intraTaxBreakup: [
    {
      taxName: "GST",
      taxPercentage: 8,
      compound: false,
    },
  ],
} as VolumeDiscountItem;

export const mockVolumeDiscountItemTaxInclusive: VolumeDiscountItem = {
  ...mockVolumeDiscountItem,
  taxInclusive: true,
  hsnDetails: {
    tax: 10,
  },
} as VolumeDiscountItem;

export const mockVolumeDiscountItemWithDiscChanged: VolumeDiscountItem = {
  ...mockVolumeDiscountItem,
  discChanged: true,
  volume_discount_obj: {
    DiscountId: "vd-1",
    Percentage: 10,
  },
} as VolumeDiscountItem;

export const mockVolumeDiscountItemCantCombine: VolumeDiscountItem = {
  ...mockVolumeDiscountItem,
  CantCombineWithOtherDisCounts: true,
  volume_discount_obj: {
    DiscountId: "vd-1",
    Percentage: 10,
  },
} as VolumeDiscountItem;

export const mockVolumeDiscountItemNoVolumeDiscount: VolumeDiscountItem = {
  ...mockVolumeDiscountItem,
  volume_discount_obj: undefined,
} as unknown as VolumeDiscountItem;

export const mockProductWithoutProductId: CartItem = {
  ...mockCartItem,
  productId: undefined,
} as unknown as CartItem;
