import { z } from "zod";
import { getSuitableDiscountByQuantity } from "./calculation/discountCalculation";

import type { CartItem } from "@/types/calculation/cart";
import type { DiscountDetails } from "@/types/calculation/discount";

const PRODUCT_DEFAULTS = {
  MIN_ORDER_QUANTITY: 1,
  PACKAGING_QUANTITY: 1,
  DISCOUNT_PERCENTAGE: 0,
  PRODUCT_COST: 0,
  ADDON_COST: 0,
} as const;

const productSchema = z
  .object({
    productId: z.union([z.string(), z.number()]).optional(),
    quantity: z.coerce.number().optional(),
    minOrderQuantity: z.coerce.number().optional(),
    packagingQty: z.coerce.number().optional(),
    packagingQuantity: z.coerce.number().optional(),
    discountsList: z.array(z.any()).optional(),
  })
  .passthrough();

const discountDataSchema = z
  .object({
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
  })
  .passthrough();

export function assignPricelistDiscountsDataToProducts(
  inputProduct: Record<string, unknown>,
  discountData: Record<string, unknown> = {},
  shouldUpdateDiscounts: boolean = true
): CartItem {
  const validatedProduct = productSchema.parse(inputProduct);
  const validatedDiscountData = discountDataSchema.parse(discountData);

  // Create a new product object to avoid mutation
  const product = {} as CartItem;
  product.productId = validatedProduct.productId ?? "";
  Object.assign(product, validatedProduct);
  product.disc_prd_related_obj = validatedDiscountData;
  product.isProductAvailableInPriceList =
    validatedDiscountData.isProductAvailableInPriceList || false;
  product.discount = 0;

  // Determine if price is not available
  const isPriceNotAvailable =
    shouldUpdateDiscounts &&
    (validatedDiscountData.MasterPrice === null ||
      validatedDiscountData.BasePrice === null ||
      !validatedDiscountData.isProductAvailableInPriceList);

  if (shouldUpdateDiscounts) {
    product.priceNotAvailable = isPriceNotAvailable;
  }

  // Set pricing data
  product.MasterPrice = validatedDiscountData.MasterPrice || 0;
  product.BasePrice = validatedDiscountData.BasePrice || 0;

  // Set pricelist data
  if (validatedDiscountData.priceListCode !== undefined) {
    product.priceListCode = validatedDiscountData.priceListCode;
  }
  if (validatedDiscountData.plnErpCode !== undefined) {
    product.plnErpCode = validatedDiscountData.plnErpCode;
  }

  // Set discounts data
  product.discountsList = validatedDiscountData.discounts || [];

  // Calculate quantity with fallbacks
  const calculatedQuantity =
    validatedProduct.quantity ||
    (validatedProduct.minOrderQuantity
      ? Number(validatedProduct.minOrderQuantity)
      : validatedProduct.packagingQty || validatedProduct.packagingQuantity
        ? Number(
            validatedProduct.packagingQty || validatedProduct.packagingQuantity
          )
        : PRODUCT_DEFAULTS.MIN_ORDER_QUANTITY);

  product.quantity = calculatedQuantity;

  // Get suitable discount
  const packagingQty =
    validatedProduct.packagingQty ||
    validatedProduct.packagingQuantity ||
    PRODUCT_DEFAULTS.PACKAGING_QUANTITY;

  const discountResult = getSuitableDiscountByQuantity(
    calculatedQuantity,
    product.discountsList,
    packagingQty
  );

  if (
    discountResult.suitableDiscount?.CantCombineWithOtherDisCounts !== undefined
  ) {
    product.CantCombineWithOtherDisCounts =
      discountResult.suitableDiscount.CantCombineWithOtherDisCounts;
  }
  product.nextSuitableDiscount = discountResult.nextSuitableDiscount;

  // Create discount details
  if (discountResult.suitableDiscount) {
    const discountDetails: DiscountDetails = {
      ...discountResult.suitableDiscount,
      BasePrice: product.BasePrice,
      ...(product.plnErpCode !== undefined
        ? { plnErpCode: product.plnErpCode }
        : {}),
      ...(product.priceListCode !== undefined
        ? { priceListCode: product.priceListCode }
        : {}),
      ...(validatedDiscountData.pricingConditionCode !== undefined
        ? { pricingConditionCode: validatedDiscountData.pricingConditionCode }
        : {}),
    };
    product.discountDetails = discountDetails;
  }

  // Calculate override discount
  const masterPrice = product.MasterPrice || 0;
  product.overrideDiscount =
    masterPrice > 0
      ? ((masterPrice - (product.BasePrice || 0)) / masterPrice) * 100
      : 0;

  if (shouldUpdateDiscounts) {
    const isOverridePricelist =
      validatedDiscountData.isOveridePricelist !== false;

    if (!isOverridePricelist) {
      // Use MasterPrice as base
      product.unitListPrice = masterPrice;
      product.discount =
        (product.overrideDiscount || 0) + (product.discountDetails?.Value || 0);
      product.discountedPrice =
        masterPrice - (masterPrice - (product.BasePrice || 0));
    } else {
      // Use BasePrice as base
      product.unitListPrice = product.BasePrice ?? 0;
      const discountValue =
        product.discountDetails?.Value ?? PRODUCT_DEFAULTS.DISCOUNT_PERCENTAGE;
      product.discount = discountValue;
      const basePrice = product.BasePrice ?? 0;
      product.discountedPrice = basePrice - (basePrice * discountValue) / 100;
    }

    product.pricingConditionCode =
      validatedDiscountData.PricingCondition || null;
  }

  product.discountPercentage =
    product.discount ?? PRODUCT_DEFAULTS.DISCOUNT_PERCENTAGE;

  // Set approval requirement
  if (validatedDiscountData.isApprovalRequired !== undefined) {
    product.isApprovalRequired = validatedDiscountData.isApprovalRequired;
  } else {
    product.isApprovalRequired = false;
  }

  return product;
}
