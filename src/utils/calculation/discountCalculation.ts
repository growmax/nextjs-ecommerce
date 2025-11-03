import { z } from "zod";
import filter from "lodash/filter";
import sortBy from "lodash/sortBy";
import first from "lodash/first";
import maxBy from "lodash/maxBy";
import toNumber from "lodash/toNumber";

import type { DiscountRange, DiscountResult } from "@/types/calculation/discount";

const quantitySchema = z.union([z.number(), z.string()]).transform(toNumber);
const discountListSchema = z.array(z.object({
  min_qty: z.number(),
  max_qty: z.number(),
  Value: z.number(),
})).min(1, "Discount list cannot be empty");

export function getSuitableDiscountByQuantity(
  quantityInput: number | string,
  discountRanges: DiscountRange[],
  _quantityIncrease: number | string
): DiscountResult {
  const quantity = quantitySchema.parse(quantityInput);
  const validatedRanges = discountListSchema.parse(discountRanges);

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const applicableRanges = validatedRanges.filter(range =>
    range.min_qty <= quantity && quantity <= range.max_qty
  );

  const suitableDiscount = maxBy(applicableRanges, "Value");

  const nextSuitableDiscount = first(
    sortBy(
      filter(validatedRanges, range => range.min_qty > quantity),
      "min_qty"
    )
  );

  return { suitableDiscount, nextSuitableDiscount };
}

interface QuantityValueResult {
  resultArr: DiscountRange[];
  nextSuitableDiscount: DiscountRange | undefined;
}

function getObjectsByQuantityValue(
  quantity: number,
  discountRanges: DiscountRange[] = [],
  _quantityIncrease: number
): QuantityValueResult {
  if (!Array.isArray(discountRanges)) {
    throw new Error("Discount ranges must be an array");
  }

  const applicableRanges: DiscountRange[] = [];

  for (const range of discountRanges) {
    if (range.min_qty <= quantity && quantity <= range.max_qty) {
      applicableRanges.push(range);
    }
  }

  const nextSuitableDiscount = first(
    sortBy(
      filter(discountRanges, range => range.min_qty > quantity),
      "min_qty"
    )
  );

  return {
    resultArr: applicableRanges,
    nextSuitableDiscount
  };
}
