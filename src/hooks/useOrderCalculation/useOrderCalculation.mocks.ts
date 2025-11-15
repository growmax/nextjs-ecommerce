// Mocks for useOrderCalculation
// You can extend these as needed for more complex test scenarios.

import type { OrderCalculationInput } from "./useOrderCalculation";

export const mockOrderCalculationInput: OrderCalculationInput = {
  products: [
    {
      productId: 1,
      quantity: 2,
      unitListPrice: 100,
      BasePrice: 100,
      unitPrice: 100,
      totalPrice: 200,
      minOrderQuantity: 1,
      shippingCharges: 10,
      totalTax: 18,
      hsnDetails: {
        interTax: {
          totalTax: 18,
          taxReqLs: [{ taxName: "IGST", rate: 18, compound: false }],
        },
        intraTax: { totalTax: 0, taxReqLs: [] },
      },
      disc_prd_related_obj: {
        MasterPrice: 100,
        BasePrice: 100,
        discounts: [
          {
            Value: 10,
            CantCombineWithOtherDisCounts: false,
            pricingConditionCode: "DISC10",
            min_qty: 1,
            max_qty: 100,
          },
        ],
      },
      cashdiscountValue: 5,
    },
  ],
  isInter: true,
  taxExemption: false,
  insuranceCharges: 0,
  shippingCharges: 0,
  pfRate: 0,
  precision: 2,
  settings: {
    roundingAdjustment: true,
    // Add other required CalculationSettings fields here
  } as any,
  options: {
    applyVolumeDiscount: false,
    applyCashDiscount: true,
    applyBasicDiscount: true,
    handleBundles: false,
    checkMOQ: true,
    applyRounding: true,
    resetShipping: false,
    resetDiscounts: false,
  },
};
