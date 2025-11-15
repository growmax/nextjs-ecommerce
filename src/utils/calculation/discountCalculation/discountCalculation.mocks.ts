// Mocks for discountCalculation utilities
// These mocks are for testing the utilities in isolation.

import type { DiscountRange } from "@/types/calculation/discount";

export const mockDiscountRanges: DiscountRange[] = [
  {
    min_qty: 1,
    max_qty: 10,
    Value: 5,
  },
  {
    min_qty: 11,
    max_qty: 50,
    Value: 10,
  },
  {
    min_qty: 51,
    max_qty: 100,
    Value: 15,
  },
  {
    min_qty: 101,
    max_qty: 500,
    Value: 20,
  },
];

export const mockDiscountRangesWithOverlap: DiscountRange[] = [
  {
    min_qty: 1,
    max_qty: 20,
    Value: 5,
  },
  {
    min_qty: 10,
    max_qty: 50,
    Value: 10,
  },
  {
    min_qty: 40,
    max_qty: 100,
    Value: 15,
  },
];

export const mockDiscountRangesWithGaps: DiscountRange[] = [
  {
    min_qty: 1,
    max_qty: 10,
    Value: 5,
  },
  {
    min_qty: 51,
    max_qty: 100,
    Value: 15,
  },
  {
    min_qty: 201,
    max_qty: 500,
    Value: 20,
  },
];

export const mockDiscountRangesSingle: DiscountRange[] = [
  {
    min_qty: 1,
    max_qty: 100,
    Value: 10,
  },
];

export const mockDiscountRangesWithCantCombine: DiscountRange[] = [
  {
    min_qty: 1,
    max_qty: 10,
    Value: 5,
    CantCombineWithOtherDisCounts: true,
  },
  {
    min_qty: 11,
    max_qty: 50,
    Value: 10,
    CantCombineWithOtherDisCounts: false,
  },
];

export const mockDiscountRangesWithPricingCondition: DiscountRange[] = [
  {
    min_qty: 1,
    max_qty: 10,
    Value: 5,
    pricingConditionCode: "PC001",
  },
  {
    min_qty: 11,
    max_qty: 50,
    Value: 10,
    pricingConditionCode: "PC002",
  },
];

export const mockEmptyDiscountRanges: DiscountRange[] = [];

export const mockDiscountRangesSameValue: DiscountRange[] = [
  {
    min_qty: 1,
    max_qty: 10,
    Value: 10,
  },
  {
    min_qty: 11,
    max_qty: 50,
    Value: 10,
  },
  {
    min_qty: 51,
    max_qty: 100,
    Value: 10,
  },
];

export const mockDiscountRangesDescendingValue: DiscountRange[] = [
  {
    min_qty: 1,
    max_qty: 10,
    Value: 20,
  },
  {
    min_qty: 11,
    max_qty: 50,
    Value: 15,
  },
  {
    min_qty: 51,
    max_qty: 100,
    Value: 10,
  },
];

export const mockDiscountRangesAscendingValue: DiscountRange[] = [
  {
    min_qty: 1,
    max_qty: 10,
    Value: 5,
  },
  {
    min_qty: 11,
    max_qty: 50,
    Value: 10,
  },
  {
    min_qty: 51,
    max_qty: 100,
    Value: 15,
  },
];
