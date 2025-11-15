import filter from "lodash/filter";
import first from "lodash/first";
import maxBy from "lodash/maxBy";
import sortBy from "lodash/sortBy";
import toNumber from "lodash/toNumber";
import { z } from "zod";

import type {
  DiscountRange,
  DiscountResult,
} from "@/types/calculation/discount";

const quantitySchema = z.union([z.number(), z.string()]).transform(toNumber);
const discountListSchema = z.array(
  z.object({
    min_qty: z.number(),
    max_qty: z.number(),
    Value: z.number(),
  })
);

export function getSuitableDiscountByQuantity(
  quantityInput: number | string,
  discountRanges: DiscountRange[],
  _quantityIncrease: number | string
): DiscountResult {
  const quantity = quantitySchema.parse(quantityInput);
  const validatedRanges = discountListSchema.parse(discountRanges);

  // Return empty result if quantity is 0 or negative
  if (quantity <= 0) {
    return { suitableDiscount: undefined, nextSuitableDiscount: undefined };
  }

  // Return empty result if no discount ranges
  if (validatedRanges.length === 0) {
    return { suitableDiscount: undefined, nextSuitableDiscount: undefined };
  }

  const applicableRanges = validatedRanges.filter(
    range => range.min_qty <= quantity && quantity <= range.max_qty
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
