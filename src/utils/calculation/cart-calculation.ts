import cloneDeep from "lodash/cloneDeep";
import round from "lodash/round";
import some from "lodash/some";

import type {
  CalculationSettings,
  CartItem,
  CartValue,
} from "@/types/calculation/cart";
import { processDiscountDetails } from "@/utils/calculation/product-utils";
import { calculateItemTaxes } from "@/utils/calculation/tax-calculation/tax-calculation";

interface CartCalculationResult {
  cartValue: CartValue;
  processedItems: CartItem[];
}

export interface CartCalculationParams {
  cartData: CartItem[];
  isInter?: boolean;
  insuranceCharges?: number;
  precision?: number;
  settings: CalculationSettings;
}

export const calculateCart = ({
  cartData,
  isInter = true,
  insuranceCharges = 0,
  precision = 2,
  settings,
}: CartCalculationParams): CartCalculationResult => {
  let cartArray = cloneDeep(cartData);

  const cartValue: CartValue = {
    totalItems: cartData.length,
    totalValue: 0,
    totalTax: 0,
    grandTotal: 0,
    totalLP: 0,
    pfRate: 0,
    totalShipping: 0,
    totalCashDiscount: 0,
    totalBasicDiscount: 0,
    cashDiscountValue: 0,
    hideListPricePublic: some(cartData, ["listPricePublic", false]),
  };

  cartArray = cartArray.map((data, index) => {
    // Apply cash discount to unit price if applicable
    if (data.cashdiscountValue && data.cashdiscountValue > 0) {
      if (!data.originalUnitPrice) {
        data.originalUnitPrice = data.unitPrice;
      }
      data.unitPrice =
        data.originalUnitPrice -
        (data.originalUnitPrice * data.cashdiscountValue) / 100;
    }

    if (!data.volumeDiscountApplied) {
      data.totalPrice = data.quantity * data.unitPrice;
    }

    if (!data.itemNo) {
      data.itemNo = new Date().getTime() + index;
    }

    data.pfItemValue = data.pfItemValue || 0;
    data.pfRate = round(data.totalPrice * (data.pfItemValue / 100), precision);
    data.itemTaxableAmount = data.unitPrice + data.pfRate / data.askedQuantity!;

    // Calculate taxes using the extracted tax calculation
    const taxResult = calculateItemTaxes(data, { isInter, precision });
    Object.assign(data, taxResult.updatedItem);

    // Update cart totals
    Object.entries(taxResult.updatedCartValue).forEach(([key, value]) => {
      if (typeof value === "number" && key in cartValue) {
        (cartValue as Record<string, number>)[key] =
          ((cartValue as Record<string, number>)[key] || 0) + value;
      }
    });

    data.totalLP = data.unitListPrice! * data.quantity;

    // Calculate cash discount
    if (
      data.cashdiscountValue &&
      data.cashdiscountValue > 0 &&
      data.originalUnitPrice
    ) {
      data.cashDiscountedPrice = round(
        (data.originalUnitPrice - data.unitPrice) * data.quantity,
        precision
      );
      cartValue.totalCashDiscount += data.cashDiscountedPrice;
      cartValue.cashDiscountValue = data.cashdiscountValue;
    }

    // Calculate basic discount
    if (data.unitListPrice && data.unitListPrice > data.unitPrice) {
      data.basicDiscountedPrice = round(
        (data.unitListPrice - data.unitPrice) * data.quantity,
        precision
      );
      cartValue.totalBasicDiscount += data.basicDiscountedPrice;
    }

    cartValue.totalShipping += data.shippingCharges! * data.quantity;
    cartValue.totalLP += data.totalLP;
    cartValue.totalTax += data.totalTax!;
    cartValue.totalValue += data.totalPrice;
    cartValue.pfRate += data.pfRate;

    return data;
  });

  // Calculate final totals after all items processed
  cartValue.taxableAmount = cartValue.totalValue + cartValue.pfRate;
  cartValue.insuranceCharges = round(insuranceCharges, precision);

  cartValue.calculatedTotal =
    cartValue.totalTax +
    cartValue.totalValue +
    cartValue.pfRate +
    cartValue.totalShipping +
    cartValue.insuranceCharges;

  cartValue.grandTotal = settings.roundingAdjustment
    ? round(cartValue.calculatedTotal)
    : cartValue.calculatedTotal;

  cartValue.roundingAdjustment =
    cartValue.grandTotal - cartValue.calculatedTotal;

  // Check for negative total prices
  if (some(cartArray, item => item.totalPrice < 0)) {
    cartValue.hasProductsWithNegativeTotalPrice = true;
  } else {
    cartValue.hasProductsWithNegativeTotalPrice = false;
  }

  // Check product availability in pricelist
  if (some(cartArray, item => !item.isProductAvailableInPriceList)) {
    cartValue.hasAllProductsAvailableInPriceList = false;
  } else {
    cartValue.hasAllProductsAvailableInPriceList = true;
  }

  return {
    cartValue,
    processedItems: cartArray,
  };
};

// Legacy export for backward compatibility
export const cartCalculation = (
  cartData: CartItem[],
  isInter = true,
  insuranceCharges = 0,
  precision = 2,
  Settings: CalculationSettings
): CartValue => {
  const result = calculateCart({
    cartData,
    isInter,
    insuranceCharges,
    precision,
    settings: Settings,
  });

  return result.cartValue;
};

// Legacy export for backward compatibility - wraps processDiscountDetails
export const discountDetails = (
  cartData: CartItem[],
  _isSeller: boolean, // Not used in new implementation
  taxExemption: boolean,
  precision = 2
): CartItem[] => {
  return processDiscountDetails(cartData, taxExemption, precision);
};
