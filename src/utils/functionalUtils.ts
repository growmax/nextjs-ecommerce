import { z } from "zod";
import { getSuitableDiscountByQuantity } from "./calculation/discount-calculation";

import type {
  CartItem,
  PriceListDiscountData,
  DiscountRange,
  DiscountResult
} from "@/types/calculation/cart";
import type { DiscountDetails } from "@/types/calculation/discount";

const PRODUCT_DEFAULTS = {
  MIN_ORDER_QUANTITY: 1,
  PACKAGING_QUANTITY: 1,
  DISCOUNT_PERCENTAGE: 0,
  PRODUCT_COST: 0,
  ADDON_COST: 0,
} as const;

const productSchema = z.object({
  quantity: z.number().optional(),
  minOrderQuantity: z.number().optional(),
  packagingQty: z.number().optional(),
  packagingQuantity: z.number().optional(),
  discountsList: z.array(z.any()).optional(),
}).passthrough();

const discountDataSchema = z.object({
  MasterPrice: z.number().nullable().optional(),
  BasePrice: z.number().nullable().optional(),
  isProductAvailableInPriceList: z.boolean().optional(),
  discounts: z.array(z.any()).optional(),
  priceListCode: z.string().optional(),
  plnErpCode: z.string().optional(),
  pricingConditionCode: z.string().nullable().optional(),
  isOveridePricelist: z.boolean().optional(),
  PricingCondition: z.string().optional(),
  isApprovalRequired: z.boolean().optional(),
}).passthrough();

export function assignPricelistDiscountsDataToProducts(
  inputProduct: Record<string, any>,
  discountData: Record<string, any> = {},
  shouldUpdateDiscounts: boolean = true
): CartItem {
  const validatedProduct = productSchema.parse(inputProduct);
  const validatedDiscountData = discountDataSchema.parse(discountData);

  // Create a new product object to avoid mutation
  const product: CartItem = {
    productId: validatedProduct.productId || "",
    ...validatedProduct,
    disc_prd_related_obj: validatedDiscountData,
    isProductAvailableInPriceList: validatedDiscountData.isProductAvailableInPriceList || false,
  };

  // Determine if price is not available
  const isPriceNotAvailable = shouldUpdateDiscounts && (
    validatedDiscountData.MasterPrice === null ||
    validatedDiscountData.BasePrice === null ||
    !validatedDiscountData.isProductAvailableInPriceList
  );

  if (shouldUpdateDiscounts) {
    product.priceNotAvailable = isPriceNotAvailable;
  }

  // Set pricing data
  product.MasterPrice = validatedDiscountData.MasterPrice || 0;
  product.BasePrice = validatedDiscountData.BasePrice || 0;

  // Set pricelist data
  product.priceListCode = validatedDiscountData.priceListCode;
  product.plnErpCode = validatedDiscountData.plnErpCode;

  // Set discounts data
  product.discountsList = validatedDiscountData.discounts || [];

  // Calculate quantity with fallbacks
  const calculatedQuantity = validatedProduct.quantity ||
    (validatedProduct.minOrderQuantity ?
      Number(validatedProduct.minOrderQuantity) :
      (validatedProduct.packagingQty || validatedProduct.packagingQuantity ?
        Number(validatedProduct.packagingQty || validatedProduct.packagingQuantity) :
        PRODUCT_DEFAULTS.MIN_ORDER_QUANTITY
      )
    );

  product.quantity = calculatedQuantity;

  // Get suitable discount
  const packagingQty = validatedProduct.packagingQty ||
    validatedProduct.packagingQuantity ||
    PRODUCT_DEFAULTS.PACKAGING_QUANTITY;

  const discountResult = getSuitableDiscountByQuantity(
    calculatedQuantity,
    product.discountsList,
    packagingQty
  );

  product.CantCombineWithOtherDisCounts = discountResult.suitableDiscount?.CantCombineWithOtherDisCounts;
  product.nextSuitableDiscount = discountResult.nextSuitableDiscount;

  // Create discount details
  if (discountResult.suitableDiscount) {
    const discountDetails: DiscountDetails = {
      ...discountResult.suitableDiscount,
      BasePrice: product.BasePrice,
      plnErpCode: product.plnErpCode,
      priceListCode: product.priceListCode,
      pricingConditionCode: validatedDiscountData.pricingConditionCode,
    };
    product.discountDetails = discountDetails;
  }

  // Calculate override discount
  const masterPrice = product.MasterPrice || 0;
  product.overrideDiscount = masterPrice > 0 ?
    ((masterPrice - (product.BasePrice || 0)) / masterPrice) * 100 : 0;

  if (shouldUpdateDiscounts) {
    const isOverridePricelist = validatedDiscountData.isOveridePricelist !== false;

    if (!isOverridePricelist) {
      // Use MasterPrice as base
      product.unitListPrice = masterPrice;
      product.discount = (product.overrideDiscount || 0) + (product.discountDetails?.Value || 0);
      product.discountedPrice = masterPrice - (masterPrice - (product.BasePrice || 0));
    } else {
      // Use BasePrice as base
      product.unitListPrice = product.BasePrice || 0;
      product.discount = product.discountDetails?.Value || PRODUCT_DEFAULTS.DISCOUNT_PERCENTAGE;
      const basePrice = product.BasePrice || 0;
      product.discountedPrice = basePrice - (basePrice * product.discount) / 100;
    }

    product.pricingConditionCode = validatedDiscountData.PricingCondition || null;
  }

  product.discountPercentage = product.discount || PRODUCT_DEFAULTS.DISCOUNT_PERCENTAGE;

  // Set approval requirement
  product.isApprovalRequired = validatedDiscountData.isApprovalRequired || false;

  return product;
}
