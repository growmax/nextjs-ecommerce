import {
  calculateVolumeDiscount,
  calculateVolumeDiscountV2,
} from "@/utils/calculation/volume-discount-calculation/volume-discount-calculation";
import {
  mockCalculationSettings,
  mockCalculationSettingsWithItemWiseTax,
  mockCalculationSettingsWithRounding,
  mockCartItem,
  mockCartItemWithCompoundTax,
  mockCartItemWithInterTax,
  mockCartItemWithIntraTax,
  mockProductWithoutProductId,
  mockVolumeDiscountData,
  mockVolumeDiscountDataMultiple,
  mockVolumeDiscountItem,
  mockVolumeDiscountItemCantCombine,
  mockVolumeDiscountItemNoVolumeDiscount,
  mockVolumeDiscountItemTaxInclusive,
  mockVolumeDiscountItemWithDiscChanged,
  mockVolumeDiscountItemWithInterTax,
  mockVolumeDiscountItemWithIntraTax,
} from "@/utils/calculation/volume-discount-calculation/volume-discount-calculation.mocks";

describe("volume-discount-calculation utilities", () => {
  describe("calculateVolumeDiscount", () => {
    it("should calculate volume discount for basic product", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result).toBeDefined();
      expect(result.products).toHaveLength(1);
      expect(result.vdDetails.subTotal).toBe(1000);
      expect(result.vdDetails.subTotalVolume).toBeGreaterThan(0);
      expect(result.pfRate).toBeGreaterThanOrEqual(0);
    });

    it("should apply volume discount to product", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products).toHaveLength(1);
      const product = result.products[0]!;
      expect(product.volumeDiscountApplied).toBe(true);
      expect(product.volumeDiscount).toBe(10);
      expect(product.unitPrice).toBeLessThan(mockCartItem.unitListPrice!);
    });

    it("should calculate unitPrice with applied discount", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products).toHaveLength(1);
      const product = result.products[0]!;
      // unitPrice = unitListPrice - (unitListPrice * appliedDiscount / 100)
      // = 100 - (100 * 10 / 100) = 90
      expect(product.unitPrice).toBe(90);
    });

    it("should calculate totalPrice correctly", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // totalPrice = askedQuantity * unitPrice = 10 * 90 = 900
      expect(product.totalPrice).toBe(900);
    });

    it("should calculate pfRate correctly", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // pfRate = totalPrice * (pfItemValue / 100) = 900 * 0.05 = 45
      expect(product.pfRate).toBe(45);
    });

    it("should calculate volume discount details correctly", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.vdDetails.subTotal).toBe(1000);
      expect(result.vdDetails.subTotalVolume).toBe(900);
      expect(result.vdDetails.volumeDiscountApplied).toBe(100);
    });

    it("should handle inter-state tax calculation", () => {
      const result = calculateVolumeDiscount(
        true,
        [mockCartItemWithInterTax],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.tax).toBe(10);
      expect(product.taxVolumeDiscountPercentage).toBeGreaterThanOrEqual(0);
    });

    it("should handle intra-state tax calculation", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItemWithIntraTax],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        8,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.tax).toBe(8);
      expect(product.taxVolumeDiscountPercentage).toBeGreaterThanOrEqual(0);
    });

    it("should handle compound tax calculation", () => {
      const result = calculateVolumeDiscount(
        true,
        [mockCartItemWithCompoundTax],
        [
          {
            itemNo: "item-2",
            volumeDiscount: 10,
            appliedDiscount: 10,
          },
        ],
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.tax).toBe(12);
    });

    it("should calculate itemTaxableAmount with shipping when beforeTax and itemWiseShippingTax", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettingsWithItemWiseTax,
        true,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.itemTaxableAmount).toBeGreaterThan(product.unitPrice);
      // itemTaxableAmount = unitPrice + pfRate / askedQuantity + shippingCharges
      expect(product.itemTaxableAmount).toBe(
        product.unitPrice! +
          product.pfRate! / product.askedQuantity! +
          (product.shippingCharges || 0)
      );
    });

    it("should calculate itemTaxableAmount without shipping when not beforeTax", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.itemTaxableAmount).toBe(
        product.unitPrice + product.pfRate! / product.askedQuantity!
      );
    });

    it("should calculate unitVolumePrice when volumeDiscount > 0", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.unitVolumePrice).toBe(90); // 100 - (100 * 10 / 100)
      expect(product.totalVolumeDiscountPrice).toBe(900); // 10 * 90
    });

    it("should calculate dmc and marginPercentage when productCost > 0", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // dmc = ((productCost + addonCost) / unitVolumePrice) * 100
      // = ((80 + 5) / 90) * 100 = 94.44
      expect(product.dmc).toBeCloseTo(94.44, 1);
      expect(product.marginPercentage).toBeCloseTo(5.56, 1);
    });

    it("should set dmc to 100 when productCost is 0", () => {
      const productWithoutCost = {
        ...mockCartItem,
        productCost: 0,
      };
      const result = calculateVolumeDiscount(
        false,
        [productWithoutCost],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.dmc).toBe(100);
      expect(product.marginPercentage).toBe(0);
    });

    it("should set volumeDiscountApplied to false when volumeDiscount is 0", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        [
          {
            itemNo: "item-1",
            volumeDiscount: 0,
            appliedDiscount: 0,
          },
        ],
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.volumeDiscountApplied).toBe(false);
    });

    it("should handle product without productId", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockProductWithoutProductId],
        [],
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products).toHaveLength(1);
      expect(result.vdDetails.subTotalVolume).toBeGreaterThan(0);
    });

    it("should handle empty volumeDiscountData", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        [],
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.vdDetails.subTotal).toBe(1000);
      expect(result.vdDetails.subTotalVolume).toBeGreaterThanOrEqual(0);
    });

    it("should calculate grandTotal correctly", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      // grandTotal = subTotalVolume + overallTax + pfRate + overallShipping
      expect(result.vdDetails.grandTotal).toBeGreaterThan(0);
    });

    it("should calculate taxableAmount with shipping when beforeTax is true", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        true,
        10,
        2
      );

      // taxableAmount = subTotalVolume + pfRate + overallShipping
      expect(result.vdDetails.taxableAmount).toBeGreaterThan(
        result.vdDetails.subTotalVolume
      );
    });

    it("should calculate taxableAmount without shipping when beforeTax is false", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        2
      );

      // taxableAmount = subTotalVolume + pfRate
      expect(result.vdDetails.taxableAmount).toBe(
        result.vdDetails.subTotalVolume + result.pfRate
      );
    });

    it("should handle multiple products", () => {
      const products = [
        mockCartItem,
        {
          ...mockCartItem,
          itemNo: "item-2",
        },
      ];
      const result = calculateVolumeDiscount(
        false,
        products,
        mockVolumeDiscountDataMultiple,
        2000,
        100,
        mockCalculationSettings,
        false,
        10,
        2
      );

      expect(result.products).toHaveLength(2);
      expect(result.vdDetails.subTotal).toBe(2000);
    });

    it("should use custom precision", () => {
      const result = calculateVolumeDiscount(
        false,
        [mockCartItem],
        mockVolumeDiscountData,
        1000,
        50,
        mockCalculationSettings,
        false,
        10,
        4
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // Check that values are rounded to 4 decimal places
      expect(
        product.unitPrice.toString().split(".")[1]?.length || 0
      ).toBeLessThanOrEqual(4);
    });
  });

  describe("calculateVolumeDiscountV2", () => {
    it("should calculate volume discount for basic product", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result).toBeDefined();
      expect(result.products).toHaveLength(1);
      expect(result.vdDetails.subTotal).toBe(1000);
      expect(result.vdDetails.subTotalVolume).toBeGreaterThan(0);
      expect(result.pfRate).toBeGreaterThanOrEqual(0);
    });

    it("should apply volume discount when volume_discount_obj exists", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.volumeDiscount).toBe(10);
      expect(product.appliedDiscount).toBe(10);
    });

    it("should not apply volume discount when CantCombineWithOtherDisCounts is true", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItemCantCombine],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.volumeDiscount).toBe(0);
      expect(product.appliedDiscount).toBe(0);
    });

    it("should apply volume discount when discChanged is true", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItemWithDiscChanged],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.volumeDiscount).toBe(10);
    });

    it("should add to additionalDiscounts when volume discount is applied", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.additionalDiscounts).toBeDefined();
      expect(product.additionalDiscounts?.length).toBeGreaterThan(0);
    });

    it("should handle taxInclusive pricing", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItemTaxInclusive],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // unitPrice should be adjusted for tax-inclusive pricing
      expect(product.unitPrice).toBeLessThanOrEqual(100);
    });

    it("should calculate unitPrice with applied discount", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // unitPrice = unitListPrice - (unitListPrice * appliedDiscount / 100)
      // = 100 - (100 * 10 / 100) = 90
      expect(product.unitPrice).toBe(90);
    });

    it("should calculate totalPrice correctly", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // totalPrice = askedQuantity * unitPrice = 10 * 90 = 900
      expect(product.totalPrice).toBe(900);
    });

    it("should calculate pfRate correctly", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // pfRate = totalPrice * (pfItemValue / 100) = 900 * 0.05 = 45
      expect(product.pfRate).toBe(45);
    });

    it("should calculate taxVolumeDiscountPercentage correctly", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // taxVolumeDiscountPercentage = ((totalPrice + pfRate) * tax) / 100
      expect(product.taxVolumeDiscountPercentage).toBeGreaterThanOrEqual(0);
    });

    it("should handle inter-state tax calculation", () => {
      const result = calculateVolumeDiscountV2(
        true,
        [mockVolumeDiscountItemWithInterTax],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.tax).toBe(10);
      expect(product.taxVolumeDiscountPercentage).toBeGreaterThanOrEqual(0);
    });

    it("should handle intra-state tax calculation", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItemWithIntraTax],
        1000,
        0,
        false,
        8,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.tax).toBe(8);
      expect(product.taxVolumeDiscountPercentage).toBeGreaterThanOrEqual(0);
    });

    it("should calculate itemTaxableAmount with shipping when beforeTax and itemWiseShippingTax", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        true,
        10,
        50,
        mockCalculationSettingsWithItemWiseTax,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.itemTaxableAmount).toBeGreaterThan(product.unitPrice!);
    });

    it("should calculate itemTaxableAmount without shipping when not beforeTax", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.itemTaxableAmount).toBe(
        product.unitPrice! + product.pfRate! / product.askedQuantity!
      );
    });

    it("should calculate unitVolumePrice when volumeDiscount > 0", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.unitVolumePrice).toBe(90); // 100 - (100 * 10 / 100)
      expect(product.totalVolumeDiscountPrice).toBe(900); // 10 * 90
    });

    it("should calculate dmc and marginPercentage when productCost > 0", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // dmc = ((productCost + addonCost) / unitVolumePrice) * 100
      // = ((80 + 5) / 90) * 100 = 94.44
      expect(product.dmc).toBeCloseTo(94.44, 1);
      expect(product.marginPercentage).toBeCloseTo(5.56, 1);
    });

    it("should set volumeDiscountApplied to false when volumeDiscount is 0", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItemNoVolumeDiscount],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      expect(product.volumeDiscountApplied).toBe(false);
    });

    it("should calculate volume discount details correctly", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.vdDetails.subTotal).toBe(1000);
      expect(result.vdDetails.subTotalVolume).toBe(900);
      expect(result.vdDetails.volumeDiscountApplied).toBe(100);
    });

    it("should include insuranceCharges in calculation", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        25,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      expect(result.vdDetails.insuranceCharges).toBe(25);
      expect(result.vdDetails.calculatedTotal).toBeGreaterThan(
        result.vdDetails.subTotalVolume
      );
    });

    it("should calculate calculatedTotal correctly", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        25,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      // calculatedTotal = subTotalVolume + totalTax + pfRate + overallShipping + insuranceCharges
      expect(result.vdDetails.calculatedTotal).toBeGreaterThan(0);
    });

    it("should handle roundingAdjustment when enabled", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        25,
        false,
        10,
        50,
        mockCalculationSettingsWithRounding,
        2
      );

      expect(result.vdDetails.grandTotal).toBeDefined();
      expect(result.vdDetails.roundingAdjustment).toBeDefined();
    });

    it("should calculate taxableAmount with shipping when beforeTax is true", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        true,
        10,
        50,
        mockCalculationSettings,
        2
      );

      // taxableAmount = subTotalVolume + pfRate + overallShipping
      expect(result.vdDetails.taxableAmount).toBeGreaterThan(
        result.vdDetails.subTotalVolume
      );
    });

    it("should calculate taxableAmount without shipping when beforeTax is false", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      // taxableAmount = subTotalVolume + pfRate
      expect(result.vdDetails.taxableAmount).toBe(
        result.vdDetails.subTotalVolume + result.pfRate
      );
    });

    it("should handle multiple products", () => {
      const products = [
        mockVolumeDiscountItem,
        {
          ...mockVolumeDiscountItem,
          productId: "prod-2",
        },
      ];
      const result = calculateVolumeDiscountV2(
        false,
        products,
        2000,
        0,
        false,
        10,
        100,
        mockCalculationSettings,
        2
      );

      expect(result.products).toHaveLength(2);
      expect(result.vdDetails.subTotal).toBe(2000);
    });

    it("should use custom precision", () => {
      const result = calculateVolumeDiscountV2(
        false,
        [mockVolumeDiscountItem],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        4
      );

      expect(result.products.length).toBeGreaterThan(0);
      const product = result.products[0]!;
      // Check that values are rounded to 4 decimal places
      expect(
        product.unitPrice!.toString().split(".")[1]?.length || 0
      ).toBeLessThanOrEqual(4);
    });

    it("should handle errors gracefully with try-catch", () => {
      // This test verifies that the function doesn't throw errors
      const invalidProduct = {
        ...mockVolumeDiscountItem,
        unitListPrice: undefined,
      } as any;

      const result = calculateVolumeDiscountV2(
        false,
        [invalidProduct],
        1000,
        0,
        false,
        10,
        50,
        mockCalculationSettings,
        2
      );

      // Should return a result even with invalid data
      expect(result).toBeDefined();
      expect(result.vdDetails).toBeDefined();
    });
  });
});
