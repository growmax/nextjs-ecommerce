import { z } from "zod";
import { getSuitableDiscountByQuantity } from "./calculation/discountCalculation";

import type { CartItem } from "@/types/calculation/cart";
import type {
  DiscountDetails,
  DiscountRange,
  PriceListDiscountData,
} from "@/types/calculation/discount";

const PRODUCT_DEFAULTS = {
  MIN_ORDER_QUANTITY: 1,
  PACKAGING_QUANTITY: 1,
  DISCOUNT_PERCENTAGE: 0,
  PRODUCT_COST: 0,
  ADDON_COST: 0,
} as const;

const productSchema = z
  .object({
    quantity: z.number().optional(),
    minOrderQuantity: z.number().optional(),
    packagingQty: z.number().optional(),
    packagingQuantity: z.number().optional(),
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

  // Determine initial pricing
  const masterPrice = validatedDiscountData.MasterPrice || 0;
  const basePrice = validatedDiscountData.BasePrice || 0;

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

  // Create a new product object to avoid mutation
  // Build product object with explicit property handling to avoid exactOptionalPropertyTypes issues

  // Create proper PriceListDiscountData object (converting undefined to null)
  const priceListDiscountData: PriceListDiscountData = {
    MasterPrice: validatedDiscountData.MasterPrice ?? null,
    BasePrice: validatedDiscountData.BasePrice ?? null,
    ...(validatedDiscountData.isProductAvailableInPriceList !== undefined && {
      isProductAvailableInPriceList:
        validatedDiscountData.isProductAvailableInPriceList,
    }),
    ...(validatedDiscountData.discounts !== undefined && {
      discounts: validatedDiscountData.discounts as DiscountRange[],
    }),
    ...(validatedDiscountData.priceListCode !== undefined && {
      priceListCode: validatedDiscountData.priceListCode,
    }),
    ...(validatedDiscountData.plnErpCode !== undefined && {
      plnErpCode: validatedDiscountData.plnErpCode,
    }),
    ...(validatedDiscountData.pricingConditionCode !== undefined && {
      pricingConditionCode: validatedDiscountData.pricingConditionCode,
    }),
    ...(validatedDiscountData.isOveridePricelist !== undefined && {
      isOveridePricelist: validatedDiscountData.isOveridePricelist,
    }),
    ...(validatedDiscountData.PricingCondition !== undefined && {
      PricingCondition: validatedDiscountData.PricingCondition,
    }),
    ...(validatedDiscountData.isApprovalRequired !== undefined && {
      isApprovalRequired: validatedDiscountData.isApprovalRequired,
    }),
  };

  const product: CartItem = {
    productId: (validatedProduct.productId as string | number) || "",
    quantity: calculatedQuantity,
    unitPrice: basePrice || masterPrice || 0,
    totalPrice: (basePrice || masterPrice || 0) * calculatedQuantity,
    disc_prd_related_obj: priceListDiscountData,
    isProductAvailableInPriceList:
      validatedDiscountData.isProductAvailableInPriceList || false,
    MasterPrice: masterPrice,
    BasePrice: basePrice,
  };

  // Copy over other properties from validatedProduct, only if they're defined
  Object.keys(validatedProduct).forEach(key => {
    const value = validatedProduct[key as keyof typeof validatedProduct];
    if (value !== undefined && key !== "productId" && key !== "quantity") {
      (product as Record<string, unknown>)[key] = value;
    }
  });

  // Determine if price is not available
  const isPriceNotAvailable =
    shouldUpdateDiscounts &&
    (validatedDiscountData.MasterPrice === null ||
      validatedDiscountData.BasePrice === null ||
      !validatedDiscountData.isProductAvailableInPriceList);

  if (shouldUpdateDiscounts) {
    product.priceNotAvailable = isPriceNotAvailable;
  }

  // Set pricelist data
  if (validatedDiscountData.priceListCode !== undefined) {
    product.priceListCode = validatedDiscountData.priceListCode;
  }
  if (validatedDiscountData.plnErpCode !== undefined) {
    product.plnErpCode = validatedDiscountData.plnErpCode;
  }

  // Set discounts data
  const discountsList = (validatedDiscountData.discounts ||
    []) as DiscountRange[];
  (product as Record<string, unknown>).discountsList = discountsList;

  // Get suitable discount
  const packagingQty =
    validatedProduct.packagingQty ||
    validatedProduct.packagingQuantity ||
    PRODUCT_DEFAULTS.PACKAGING_QUANTITY;

  const discountResult = getSuitableDiscountByQuantity(
    product.quantity,
    discountsList,
    packagingQty
  );

  if (
    discountResult.suitableDiscount?.CantCombineWithOtherDisCounts !== undefined
  ) {
    product.CantCombineWithOtherDisCounts =
      discountResult.suitableDiscount.CantCombineWithOtherDisCounts;
  }
  if (discountResult.nextSuitableDiscount !== undefined) {
    product.nextSuitableDiscount = discountResult.nextSuitableDiscount;
  }

  // Create discount details
  if (discountResult.suitableDiscount) {
    const basePriceValue = product.BasePrice ?? 0;
    const discountDetails: DiscountDetails = {
      ...discountResult.suitableDiscount,
      BasePrice: basePriceValue,
      ...(product.plnErpCode !== undefined && {
        plnErpCode: product.plnErpCode,
      }),
      ...(product.priceListCode !== undefined && {
        priceListCode: product.priceListCode,
      }),
      ...(validatedDiscountData.pricingConditionCode !== undefined && {
        pricingConditionCode: validatedDiscountData.pricingConditionCode,
      }),
    };
    product.discountDetails = discountDetails;
  }

  // Calculate override discount
  const masterPriceValue = product.MasterPrice ?? 0;
  product.overrideDiscount =
    masterPriceValue > 0
      ? ((masterPriceValue - (product.BasePrice || 0)) / masterPriceValue) * 100
      : 0;

  if (shouldUpdateDiscounts) {
    const isOverridePricelist =
      validatedDiscountData.isOveridePricelist !== false;

    if (!isOverridePricelist) {
      // Use MasterPrice as base
      product.unitListPrice = masterPriceValue;
      const discountValue = discountResult.suitableDiscount?.Value || 0;
      product.discount = (product.overrideDiscount || 0) + discountValue;
      product.discountedPrice =
        masterPriceValue - (masterPriceValue - (product.BasePrice || 0));
    } else {
      // Use BasePrice as base
      product.unitListPrice = product.BasePrice || 0;
      const discountValue =
        discountResult.suitableDiscount?.Value ||
        PRODUCT_DEFAULTS.DISCOUNT_PERCENTAGE;
      product.discount = discountValue;
      const basePrice = product.BasePrice || 0;
      product.discountedPrice = basePrice - (basePrice * discountValue) / 100;
    }

    product.pricingConditionCode =
      validatedDiscountData.PricingCondition || null;
  }

  product.discountPercentage =
    product.discount || PRODUCT_DEFAULTS.DISCOUNT_PERCENTAGE;

  // Set approval requirement
  product.isApprovalRequired =
    validatedDiscountData.isApprovalRequired || false;

  return product;
}
