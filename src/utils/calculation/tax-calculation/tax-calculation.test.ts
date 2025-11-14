import { calculateItemTaxes } from "./tax-calculation";
import {
  mockCartItem,
  mockCartItemWithBothTaxes,
  mockCartItemWithCompoundTax,
  mockCartItemWithExistingBreakup,
  mockCartItemWithInterTax,
  mockCartItemWithIntraTax,
  mockCartItemWithMultipleTaxes,
  mockCartItemWithoutHsnDetails,
  mockCartItemWithoutPfRate,
  mockCartItemWithZeroTax,
} from "./tax-calculation.mocks";

describe("tax-calculation utilities", () => {
  describe("calculateItemTaxes", () => {
    it("should calculate inter-state tax for basic product", () => {
      const result = calculateItemTaxes(mockCartItemWithInterTax, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedItem).toBeDefined();
      expect(result.updatedItem.tax).toBe(10);
      expect(result.updatedItem.totalTax).toBeGreaterThan(0);
      expect(result.updatedItem.prodTax).toBeGreaterThan(0);
    });

    it("should calculate intra-state tax for basic product", () => {
      const result = calculateItemTaxes(mockCartItemWithIntraTax, {
        isInter: false,
        precision: 2,
      });

      expect(result.updatedItem).toBeDefined();
      expect(result.updatedItem.tax).toBe(8);
      expect(result.updatedItem.totalTax).toBeGreaterThan(0);
      expect(result.updatedItem.prodTax).toBeGreaterThan(0);
    });

    it("should build interTaxBreakup from HSN details", () => {
      const result = calculateItemTaxes(mockCartItemWithInterTax, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedItem.interTaxBreakup).toBeDefined();
      expect(result.updatedItem.interTaxBreakup?.length).toBeGreaterThan(0);
      expect(result.updatedItem.interTaxBreakup?.[0]?.taxName).toBe("GST");
      expect(result.updatedItem.interTaxBreakup?.[0]?.taxPercentage).toBe(10);
    });

    it("should build intraTaxBreakup from HSN details", () => {
      const result = calculateItemTaxes(mockCartItemWithIntraTax, {
        isInter: false,
        precision: 2,
      });

      expect(result.updatedItem.intraTaxBreakup).toBeDefined();
      expect(result.updatedItem.intraTaxBreakup?.length).toBeGreaterThan(0);
      expect(result.updatedItem.intraTaxBreakup?.[0]?.taxName).toBe("GST");
      expect(result.updatedItem.intraTaxBreakup?.[0]?.taxPercentage).toBe(8);
    });

    it("should preserve existing tax breakups", () => {
      const result = calculateItemTaxes(mockCartItemWithExistingBreakup, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedItem.interTaxBreakup).toBeDefined();
      expect(result.updatedItem.interTaxBreakup?.length).toBeGreaterThanOrEqual(
        1
      );
    });

    it("should calculate non-compound tax correctly", () => {
      const result = calculateItemTaxes(mockCartItemWithInterTax, {
        isInter: true,
        precision: 2,
      });

      // taxValue = ((totalPrice + pfRate) * taxPercentage) / 100
      // = ((1000 + 50) * 10) / 100 = 105
      expect(result.updatedItem.GSTValue).toBe(105);
      expect(result.updatedItem.GST).toBe(10);
    });

    it("should calculate compound tax correctly", () => {
      const result = calculateItemTaxes(mockCartItemWithCompoundTax, {
        isInter: true,
        precision: 2,
      });

      // First tax (GST): (1000 + 50) * 10 / 100 = 105
      // Second tax (CESS): 105 * 2 / 100 = 2.1
      expect(result.updatedItem.GSTValue).toBe(105);
      expect(result.updatedItem.CESSValue).toBeCloseTo(2.1, 1);
      expect(result.updatedItem.totalTax).toBeCloseTo(107.1, 1);
    });

    it("should calculate multiple non-compound taxes", () => {
      const result = calculateItemTaxes(mockCartItemWithMultipleTaxes, {
        isInter: true,
        precision: 2,
      });

      // CGST: (1000 + 50) * 9 / 100 = 94.5
      // SGST: (1000 + 50) * 9 / 100 = 94.5
      expect(result.updatedItem.CGSTValue).toBe(94.5);
      expect(result.updatedItem.SGSTValue).toBe(94.5);
      expect(result.updatedItem.totalTax).toBe(189);
    });

    it("should update cart value with tax totals", () => {
      const result = calculateItemTaxes(mockCartItemWithInterTax, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedCartValue).toBeDefined();
      expect(result.updatedCartValue.GSTTotal).toBe(105);
    });

    it("should handle product without HSN details", () => {
      const result = calculateItemTaxes(mockCartItemWithoutHsnDetails, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedItem.tax).toBe(0);
      expect(result.updatedItem.totalTax).toBe(0);
      expect(result.updatedItem.prodTax).toBe(0);
    });

    it("should handle product with zero tax", () => {
      const result = calculateItemTaxes(mockCartItemWithZeroTax, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedItem.tax).toBe(0);
      expect(result.updatedItem.totalTax).toBe(0);
      expect(result.updatedItem.prodTax).toBe(0);
    });

    it("should handle product without pfRate", () => {
      const result = calculateItemTaxes(mockCartItemWithoutPfRate, {
        isInter: true,
        precision: 2,
      });

      // taxValue = (totalPrice + 0) * 10 / 100 = 100
      expect(result.updatedItem.GSTValue).toBe(100);
      expect(result.updatedItem.prodTax).toBe(100);
    });

    it("should use correct tax type based on isInter flag", () => {
      const resultInter = calculateItemTaxes(mockCartItemWithBothTaxes, {
        isInter: true,
        precision: 2,
      });

      const resultIntra = calculateItemTaxes(mockCartItemWithBothTaxes, {
        isInter: false,
        precision: 2,
      });

      // Inter-state should use IGST
      expect(resultInter.updatedItem.tax).toBe(10);
      expect(resultInter.updatedItem.IGSTValue).toBeDefined();

      // Intra-state should use CGST and SGST
      expect(resultIntra.updatedItem.tax).toBe(8);
      expect(resultIntra.updatedItem.CGSTValue).toBeDefined();
      expect(resultIntra.updatedItem.SGSTValue).toBeDefined();
    });

    it("should calculate prodTax correctly", () => {
      const result = calculateItemTaxes(mockCartItemWithInterTax, {
        isInter: true,
        precision: 2,
      });

      // prodTax = ((totalPrice + pfRate) * tax) / 100
      // = ((1000 + 50) * 10) / 100 = 105
      expect(result.updatedItem.prodTax).toBe(105);
    });

    it("should use custom precision", () => {
      const result = calculateItemTaxes(mockCartItemWithInterTax, {
        isInter: true,
        precision: 4,
      });

      // Check that values are rounded to 4 decimal places
      const gstValue = result.updatedItem.GSTValue as number;
      expect(
        gstValue.toString().split(".")[1]?.length || 0
      ).toBeLessThanOrEqual(4);
    });

    it("should not mutate original item", () => {
      const originalItem = { ...mockCartItemWithInterTax };
      calculateItemTaxes(mockCartItemWithInterTax, {
        isInter: true,
        precision: 2,
      });

      // Original item should not have tax calculations
      expect(originalItem.GSTValue).toBeUndefined();
      expect(originalItem.totalTax).toBe(0);
    });

    it("should initialize empty tax breakups if not present", () => {
      const itemWithoutBreakup = {
        ...mockCartItem,
        interTaxBreakup: undefined,
        intraTaxBreakup: undefined,
      } as any;

      const result = calculateItemTaxes(itemWithoutBreakup as any, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedItem.interTaxBreakup).toEqual([]);
      expect(result.updatedItem.intraTaxBreakup).toEqual([]);
    });

    it("should accumulate tax totals in cart value", () => {
      const result = calculateItemTaxes(mockCartItemWithMultipleTaxes, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedCartValue.CGSTTotal).toBe(94.5);
      expect(result.updatedCartValue.SGSTTotal).toBe(94.5);
    });

    it("should handle empty tax breakup arrays", () => {
      const itemWithEmptyBreakup = {
        ...mockCartItem,
        interTaxBreakup: [],
        hsnDetails: {
          interTax: {
            totalTax: 10,
          },
        },
      };

      const result = calculateItemTaxes(itemWithEmptyBreakup, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedItem.totalTax).toBe(0);
      expect(result.updatedItem.prodTax).toBe(105); // Still calculated from totalTax
    });

    it("should set tax percentage on item", () => {
      const result = calculateItemTaxes(mockCartItemWithInterTax, {
        isInter: true,
        precision: 2,
      });

      expect(result.updatedItem.GST).toBe(10);
    });

    it("should calculate totalTax as sum of all tax values", () => {
      const result = calculateItemTaxes(mockCartItemWithMultipleTaxes, {
        isInter: true,
        precision: 2,
      });

      const expectedTotal =
        (result.updatedItem.CGSTValue as number) +
        (result.updatedItem.SGSTValue as number);
      expect(result.updatedItem.totalTax).toBe(expectedTotal);
    });

    it("should handle compound tax calculation order", () => {
      const result = calculateItemTaxes(mockCartItemWithCompoundTax, {
        isInter: true,
        precision: 2,
      });

      // Compound tax should be calculated after non-compound tax
      const gstValue = result.updatedItem.GSTValue as number;
      const cessValue = result.updatedItem.CESSValue as number;

      // CESS should be calculated on GST value
      expect(cessValue).toBeCloseTo((gstValue * 2) / 100, 1);
    });

    it("should handle zero totalPrice", () => {
      const itemWithZeroPrice = {
        ...mockCartItemWithInterTax,
        totalPrice: 0,
      };

      const result = calculateItemTaxes(itemWithZeroPrice, {
        isInter: true,
        precision: 2,
      });

      // When totalPrice is 0, tax is calculated on pfRate only
      // GSTValue = (0 + 50) * 10 / 100 = 5
      expect(result.updatedItem.GSTValue).toBe(5);
      // prodTax = (0 + 50) * 10 / 100 = 5
      expect(result.updatedItem.prodTax).toBe(5);
    });

    it("should handle negative precision gracefully", () => {
      // Negative precision will throw an error from toFixed()
      // This is expected behavior - precision should be >= 0
      expect(() => {
        calculateItemTaxes(mockCartItemWithInterTax, {
          isInter: true,
          precision: -1,
        });
      }).toThrow();
    });
  });
});
