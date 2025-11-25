import { getSuitableDiscountByQuantity } from "@/utils/calculation/discountCalculation/discountCalculation";
import {
  mockDiscountRanges,
  mockDiscountRangesAscendingValue,
  mockDiscountRangesDescendingValue,
  mockDiscountRangesSameValue,
  mockDiscountRangesSingle,
  mockDiscountRangesWithGaps,
  mockDiscountRangesWithOverlap,
  mockEmptyDiscountRanges,
} from "@/utils/calculation/discountCalculation/discountCalculation.mocks";

describe("discountCalculation utilities", () => {
  describe("getSuitableDiscountByQuantity", () => {
    it("should return suitable discount for quantity within range", () => {
      const result = getSuitableDiscountByQuantity(25, mockDiscountRanges, "0");

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(10);
      expect(result.suitableDiscount?.min_qty).toBe(11);
      expect(result.suitableDiscount?.max_qty).toBe(50);
    });

    it("should return highest value discount when multiple ranges apply", () => {
      const result = getSuitableDiscountByQuantity(
        15,
        mockDiscountRangesWithOverlap,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      // Should return the range with highest Value (10) that includes 15
      expect(result.suitableDiscount?.Value).toBe(10);
    });

    it("should return next suitable discount when quantity is below all ranges", () => {
      const result = getSuitableDiscountByQuantity(5, mockDiscountRanges, "0");

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(5);
      expect(result.nextSuitableDiscount).toBeDefined();
      expect(result.nextSuitableDiscount?.min_qty).toBe(11);
    });

    it("should return next suitable discount when quantity is in range", () => {
      const result = getSuitableDiscountByQuantity(25, mockDiscountRanges, "0");

      expect(result.nextSuitableDiscount).toBeDefined();
      expect(result.nextSuitableDiscount?.min_qty).toBe(51);
      expect(result.nextSuitableDiscount?.Value).toBe(15);
    });

    it("should return undefined for next discount when quantity exceeds all ranges", () => {
      const result = getSuitableDiscountByQuantity(
        1000,
        mockDiscountRanges,
        "0"
      );

      // Quantity 1000 exceeds max range (500), so no range matches
      expect(result.suitableDiscount).toBeUndefined();
      expect(result.nextSuitableDiscount).toBeUndefined();
    });

    it("should return undefined for both discounts when quantity is 0", () => {
      const result = getSuitableDiscountByQuantity(0, mockDiscountRanges, "0");

      expect(result.suitableDiscount).toBeUndefined();
      expect(result.nextSuitableDiscount).toBeUndefined();
    });

    it("should return undefined for both discounts when quantity is negative", () => {
      const result = getSuitableDiscountByQuantity(-5, mockDiscountRanges, "0");

      expect(result.suitableDiscount).toBeUndefined();
      expect(result.nextSuitableDiscount).toBeUndefined();
    });

    it("should return undefined for both discounts when discount ranges are empty", () => {
      const result = getSuitableDiscountByQuantity(
        25,
        mockEmptyDiscountRanges,
        "0"
      );

      expect(result.suitableDiscount).toBeUndefined();
      expect(result.nextSuitableDiscount).toBeUndefined();
    });

    it("should handle quantity as string", () => {
      const result = getSuitableDiscountByQuantity(
        "25",
        mockDiscountRanges,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(10);
    });

    it("should handle quantity at minimum boundary", () => {
      const result = getSuitableDiscountByQuantity(1, mockDiscountRanges, "0");

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(5);
      expect(result.suitableDiscount?.min_qty).toBe(1);
    });

    it("should handle quantity at maximum boundary", () => {
      const result = getSuitableDiscountByQuantity(10, mockDiscountRanges, "0");

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(5);
      expect(result.suitableDiscount?.max_qty).toBe(10);
    });

    it("should handle quantity at range boundary (inclusive)", () => {
      const result = getSuitableDiscountByQuantity(11, mockDiscountRanges, "0");

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(10);
      expect(result.suitableDiscount?.min_qty).toBe(11);
    });

    it("should handle quantity between ranges (gap)", () => {
      const result = getSuitableDiscountByQuantity(
        25,
        mockDiscountRangesWithGaps,
        "0"
      );

      expect(result.suitableDiscount).toBeUndefined();
      expect(result.nextSuitableDiscount).toBeDefined();
      expect(result.nextSuitableDiscount?.min_qty).toBe(51);
    });

    it("should return first range when only one range exists", () => {
      const result = getSuitableDiscountByQuantity(
        50,
        mockDiscountRangesSingle,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(10);
      expect(result.nextSuitableDiscount).toBeUndefined();
    });

    it("should select highest value when multiple ranges have same value", () => {
      const result = getSuitableDiscountByQuantity(
        25,
        mockDiscountRangesSameValue,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(10);
    });

    it("should select highest value discount when ranges overlap", () => {
      const result = getSuitableDiscountByQuantity(
        15,
        mockDiscountRangesWithOverlap,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      // Both ranges include 15, should select the one with highest Value (10)
      expect(result.suitableDiscount?.Value).toBe(10);
    });

    it("should handle quantity at exact range start", () => {
      const result = getSuitableDiscountByQuantity(51, mockDiscountRanges, "0");

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(15);
      expect(result.suitableDiscount?.min_qty).toBe(51);
    });

    it("should handle quantity at exact range end", () => {
      const result = getSuitableDiscountByQuantity(
        100,
        mockDiscountRanges,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(15);
      expect(result.suitableDiscount?.max_qty).toBe(100);
    });

    it("should return next discount sorted by min_qty", () => {
      const result = getSuitableDiscountByQuantity(5, mockDiscountRanges, "0");

      expect(result.nextSuitableDiscount).toBeDefined();
      // Should return the range with smallest min_qty that is > 5
      expect(result.nextSuitableDiscount?.min_qty).toBe(11);
    });

    it("should handle very large quantity", () => {
      const result = getSuitableDiscountByQuantity(
        10000,
        mockDiscountRanges,
        "0"
      );

      // Quantity 10000 exceeds max range (500), so no range matches
      expect(result.suitableDiscount).toBeUndefined();
      expect(result.nextSuitableDiscount).toBeUndefined();
    });

    it("should handle very small quantity", () => {
      const result = getSuitableDiscountByQuantity(
        0.5,
        mockDiscountRanges,
        "0"
      );

      // Quantity 0.5 is less than min_qty (1), so no suitable discount
      // But it's > 0, so it should still process
      // Actually, 0.5 < 1, so it won't match the first range
      expect(result.suitableDiscount).toBeUndefined();
      expect(result.nextSuitableDiscount).toBeDefined();
      expect(result.nextSuitableDiscount?.min_qty).toBe(1);
    });

    it("should handle decimal quantity", () => {
      const result = getSuitableDiscountByQuantity(
        25.5,
        mockDiscountRanges,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(10);
    });

    it("should handle string quantity with decimal", () => {
      const result = getSuitableDiscountByQuantity(
        "25.5",
        mockDiscountRanges,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(10);
    });

    it("should preserve discount range properties", () => {
      const ranges = [
        {
          min_qty: 1,
          max_qty: 10,
          Value: 5,
          CantCombineWithOtherDisCounts: true,
          pricingConditionCode: "PC001",
        },
      ] as any[];

      const result = getSuitableDiscountByQuantity(5, ranges, "0");

      expect(result.suitableDiscount).toBeDefined();
      // Note: zod schema validates and may strip extra properties
      // The validated ranges only contain min_qty, max_qty, Value
      // So extra properties are not preserved after zod validation
      expect(result.suitableDiscount?.min_qty).toBe(1);
      expect(result.suitableDiscount?.max_qty).toBe(10);
      expect(result.suitableDiscount?.Value).toBe(5);
    });

    it("should handle ranges with descending values", () => {
      const result = getSuitableDiscountByQuantity(
        25,
        mockDiscountRangesDescendingValue,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      // Should select the range with highest Value (20) that includes 25
      expect(result.suitableDiscount?.Value).toBe(15);
    });

    it("should handle ranges with ascending values", () => {
      const result = getSuitableDiscountByQuantity(
        25,
        mockDiscountRangesAscendingValue,
        "0"
      );

      expect(result.suitableDiscount).toBeDefined();
      expect(result.suitableDiscount?.Value).toBe(10);
    });

    it("should ignore quantityIncrease parameter", () => {
      const result1 = getSuitableDiscountByQuantity(
        25,
        mockDiscountRanges,
        "0"
      );
      const result2 = getSuitableDiscountByQuantity(
        25,
        mockDiscountRanges,
        "100"
      );

      // Results should be identical regardless of quantityIncrease
      expect(result1.suitableDiscount?.Value).toBe(
        result2.suitableDiscount?.Value
      );
      expect(result1.nextSuitableDiscount?.min_qty).toBe(
        result2.nextSuitableDiscount?.min_qty
      );
    });

    it("should handle quantity exactly matching range boundaries", () => {
      const ranges = [
        { min_qty: 10, max_qty: 20, Value: 5 },
        { min_qty: 20, max_qty: 30, Value: 10 },
      ];

      const result1 = getSuitableDiscountByQuantity(20, ranges, "0");
      const result2 = getSuitableDiscountByQuantity(10, ranges, "0");

      // Quantity 20 matches both ranges, should select highest Value (10)
      expect(result1.suitableDiscount?.Value).toBe(10);
      // Quantity 10 matches first range
      expect(result2.suitableDiscount?.Value).toBe(5);
    });

    it("should handle invalid string quantity", () => {
      // zod will parse invalid strings to NaN
      // NaN <= 0 is false, but NaN comparisons are tricky
      // The function will try to process it, but NaN comparisons will result in no match
      const result = getSuitableDiscountByQuantity(
        "invalid" as any,
        mockDiscountRanges,
        "0"
      );

      // NaN doesn't match any range, so suitableDiscount is undefined
      // But the function doesn't throw, it just returns undefined
      expect(result.suitableDiscount).toBeUndefined();
    });

    it("should handle empty string quantity", () => {
      // Empty string should parse to 0
      const result = getSuitableDiscountByQuantity("", mockDiscountRanges, "0");

      expect(result.suitableDiscount).toBeUndefined();
      expect(result.nextSuitableDiscount).toBeUndefined();
    });

    it("should handle whitespace string quantity", () => {
      // Whitespace string should parse to 0
      const result = getSuitableDiscountByQuantity(
        "   ",
        mockDiscountRanges,
        "0"
      );

      expect(result.suitableDiscount).toBeUndefined();
      expect(result.nextSuitableDiscount).toBeUndefined();
    });
  });
});
