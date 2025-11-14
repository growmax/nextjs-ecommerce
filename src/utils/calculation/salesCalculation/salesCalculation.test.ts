import {
  getAccounting,
  getPriceInfo,
  manipulateProductsElasticData,
  roundOf,
  setTaxDetails,
} from "./salesCalculation";
import {
  mockCurrencyOptions,
  mockCustomCurrencyOptions,
  mockElasticProductData,
  mockElasticProductDataWithoutOptional,
  mockExistingProduct,
  mockExistingProductWithHsn,
  mockProductDetail,
  mockProductDetailWithCompoundTax,
} from "./salesCalculation.mocks";

describe("salesCalculation utilities", () => {
  describe("getPriceInfo", () => {
    it("should set isPriceNotAvailable when price is not available", () => {
      const result = getPriceInfo(1000, true, true);

      expect(result.isPriceNotAvailable).toBe(true);
    });

    it("should show discounted price, unit list price, and discount when showPrice is true and price exists", () => {
      const result = getPriceInfo(1000, true, false);

      expect(result.ShowDiscountedPrice).toBe(true);
      expect(result.ShowUnitListPrice).toBe(true);
      expect(result.ShowDiscount).toBe(true);
      expect(result.isPriceNotAvailable).toBeUndefined();
    });

    it("should show only discounted price when showPrice is true but no price", () => {
      const result = getPriceInfo(null, true, false);

      expect(result.ShowDiscountedPrice).toBe(true);
      expect(result.ShowUnitListPrice).toBeUndefined();
      expect(result.ShowDiscount).toBeUndefined();
    });

    it("should show request price when showPrice is false and no price", () => {
      const result = getPriceInfo(null, false, false);

      expect(result.ShowRequestPrice).toBe(true);
      expect(result.ShowDiscountedPrice).toBeUndefined();
    });

    it("should show request price when showPrice is false but price exists", () => {
      const result = getPriceInfo(1000, false, false);

      expect(result.ShowRequestPrice).toBe(true);
      expect(result.ShowDiscountedPrice).toBeUndefined();
    });

    it("should prioritize isPriceNotAvailable over other flags", () => {
      const result = getPriceInfo(1000, true, true);

      expect(result.isPriceNotAvailable).toBe(true);
      expect(result.ShowDiscountedPrice).toBeUndefined();
    });

    it("should handle undefined price", () => {
      const result = getPriceInfo(undefined, true, false);

      expect(result.ShowDiscountedPrice).toBe(true);
    });

    it("should handle zero price", () => {
      const result = getPriceInfo(0, true, false);

      // 0 is falsy, so treated as no price
      expect(result.ShowDiscountedPrice).toBe(true);
      expect(result.ShowUnitListPrice).toBeUndefined();
    });
  });

  describe("getAccounting", () => {
    it("should format number with default currency when user is null", () => {
      const result = getAccounting(null, 1000);

      expect(result).toContain("₹");
      expect(result).toContain("1,000");
    });

    it("should format number with user currency options", () => {
      const result = getAccounting(mockCurrencyOptions, 1000);

      expect(result).toContain("$");
      expect(result).toContain("1,000");
    });

    it("should use CustomSymbol when provided", () => {
      const result = getAccounting(
        mockCurrencyOptions,
        1000,
        mockCustomCurrencyOptions
      );

      expect(result).toContain("€");
    });

    it("should handle string input", () => {
      const result = getAccounting(mockCurrencyOptions, "1000");

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should return zero formatted when input is null", () => {
      const result = getAccounting(mockCurrencyOptions, null);

      expect(result).toContain("0");
    });

    it("should return zero formatted when input is undefined", () => {
      const result = getAccounting(mockCurrencyOptions, undefined);

      expect(result).toContain("0");
    });

    it("should return zero formatted when input is not finite", () => {
      const result = getAccounting(mockCurrencyOptions, "invalid");

      expect(result).toContain("0");
    });

    it("should return zero formatted when input is Infinity", () => {
      const result = getAccounting(mockCurrencyOptions, Infinity);

      expect(result).toContain("0");
    });

    it("should handle decimal numbers", () => {
      const result = getAccounting(mockCurrencyOptions, 1234.56);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should use custom precision from currency options", () => {
      const customOptions = {
        ...mockCurrencyOptions,
        precision: 4,
      };
      const result = getAccounting(customOptions, 1234.5678);

      expect(result).toBeDefined();
    });
  });

  describe("roundOf", () => {
    it("should round number to 2 decimal places", () => {
      const result = roundOf(123.456);

      expect(result).toBe(123.46);
    });

    it("should handle string input", () => {
      const result = roundOf("123.456");

      expect(result).toBe(123.46);
    });

    it("should return 0 for null", () => {
      const result = roundOf(null);

      expect(result).toBe(0);
    });

    it("should return 0 for undefined", () => {
      const result = roundOf(undefined);

      expect(result).toBe(0);
    });

    it("should handle integers", () => {
      const result = roundOf(100);

      expect(result).toBe(100);
    });

    it("should handle negative numbers", () => {
      const result = roundOf(-123.456);

      expect(result).toBe(-123.46);
    });

    it("should handle very small numbers", () => {
      const result = roundOf(0.001);

      expect(result).toBe(0);
    });

    it("should handle very large numbers", () => {
      const result = roundOf(999999.999);

      expect(result).toBe(1000000);
    });

    it("should handle zero", () => {
      const result = roundOf(0);

      expect(result).toBe(0);
    });
  });

  describe("manipulateProductsElasticData", () => {
    it("should transform single product data", () => {
      const result = manipulateProductsElasticData(mockElasticProductData);

      expect(result).toBeDefined();
      expect((result as any).businessUnit).toBeDefined();
      expect((result as any).businessUnit?.id).toBe("BU-1");
      expect((result as any).division).toBeDefined();
      expect((result as any).division?.id).toBe("DIV-1");
      expect((result as any).hsnDetails).toBeDefined();
      expect((result as any).inventoryResponse).toBeDefined();
    });

    it("should transform array of products", () => {
      const products = [
        mockElasticProductData,
        { ...mockElasticProductData, businessUnitId: "BU-2" },
      ];
      const result = manipulateProductsElasticData(products);

      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBe(2);
    });

    it("should set businessUnit to null when businessUnitId is missing", () => {
      const result = manipulateProductsElasticData(
        mockElasticProductDataWithoutOptional
      );

      expect((result as any).businessUnit).toBeNull();
    });

    it("should set division to null when divisionId is missing", () => {
      const result = manipulateProductsElasticData(
        mockElasticProductDataWithoutOptional
      );

      expect((result as any).division).toBeNull();
    });

    it("should build hsnDetails from hsnTaxBreakup", () => {
      const result = manipulateProductsElasticData(mockElasticProductData);

      expect((result as any).hsnDetails.interTax).toBe(10);
      expect((result as any).hsnDetails.intraTax).toBe(8);
      expect((result as any).hsnDetails.tax).toBe(10);
    });

    it("should build inventoryResponse from inventory", () => {
      const result = manipulateProductsElasticData(mockElasticProductData);

      expect((result as any).inventoryResponse.inStock).toBe(true);
      expect((result as any).inventoryResponse.availableStock).toBe(100);
      expect((result as any).inventoryResponse.inventoryData).toEqual([
        { availableQty: 100 },
      ]);
    });

    it("should set inStock to false when inventory is empty", () => {
      const result = manipulateProductsElasticData(
        mockElasticProductDataWithoutOptional
      );

      expect((result as any).inventoryResponse.inStock).toBe(false);
      expect((result as any).inventoryResponse.availableStock).toBeNull();
    });

    it("should map listpricePublic to listPricePublic", () => {
      const result = manipulateProductsElasticData(mockElasticProductData);

      expect((result as any).listPricePublic).toBe(1000);
    });

    it("should map standardLeadTime to deliveryLeadTime", () => {
      const result = manipulateProductsElasticData(mockElasticProductData);

      expect((result as any).deliveryLeadTime).toBe(5);
    });

    it("should map customProduct to isCustomProduct", () => {
      const result = manipulateProductsElasticData(mockElasticProductData);

      expect((result as any).isCustomProduct).toBe(false);
    });

    it("should map packagingQty to packagingQuantity", () => {
      const result = manipulateProductsElasticData(mockElasticProductData);

      expect((result as any).packagingQuantity).toBe(10);
    });

    it("should find primary product category", () => {
      const result = manipulateProductsElasticData(mockElasticProductData);

      expect((result as any).primary_products_categoryObjects).toBeDefined();
      expect((result as any).primary_products_categoryObjects?.isPrimary).toBe(
        1
      );
    });

    it("should handle missing optional fields", () => {
      const result = manipulateProductsElasticData(
        mockElasticProductDataWithoutOptional
      );

      expect((result as any).hsnDetails.description).toBe("");
      expect((result as any).hsnDetails.hsnCode).toBe("");
      expect((result as any).hsnDetails.id).toBe("");
    });
  });

  describe("setTaxDetails", () => {
    it("should return undefined when existingPrdArr is undefined", () => {
      const result = setTaxDetails(undefined, [mockProductDetail], true, false);

      expect(result).toBeUndefined();
    });

    it("should set tax details for inter-state transaction", () => {
      const result = setTaxDetails(
        [mockExistingProduct],
        [mockProductDetail],
        true,
        false
      );

      expect(result).toBeDefined();
      expect(result!.length).toBeGreaterThan(0);
      expect(result![0]!.tax).toBe(10);
      expect(result![0]!.totalInterTax).toBe(10);
      expect(result![0]!.interTaxBreakup).toBeDefined();
      expect(result![0]!.interTaxBreakup?.length).toBe(1);
      expect(result![0]!.productTaxes).toBe(result![0]!.interTaxBreakup);
    });

    it("should set tax details for intra-state transaction", () => {
      const result = setTaxDetails(
        [mockExistingProduct],
        [mockProductDetail],
        false,
        false
      );

      expect(result).toBeDefined();
      expect(result!.length).toBeGreaterThan(0);
      expect(result![0]!.tax).toBe(10);
      expect(result![0]!.totalIntraTax).toBe(8);
      expect(result![0]!.intraTaxBreakup).toBeDefined();
      expect(result![0]!.intraTaxBreakup?.length).toBe(2);
      expect(result![0]!.productTaxes).toBe(result![0]!.intraTaxBreakup);
    });

    it("should set all taxes to 0 when taxExemption is true", () => {
      const result = setTaxDetails(
        [mockExistingProduct],
        [mockProductDetail],
        true,
        true
      );

      expect(result![0]!.tax).toBe(0);
      expect(result![0]!.totalInterTax).toBe(0);
      expect(result![0]!.totalIntraTax).toBe(0);
      expect(result![0]!.interTaxBreakup?.[0]?.taxPercentage).toBe(0);
    });

    it("should handle compound taxes correctly", () => {
      const result = setTaxDetails(
        [mockExistingProduct],
        [mockProductDetailWithCompoundTax],
        true,
        false
      );

      expect(result![0]!.interTaxBreakup).toBeDefined();
      // Compound tax should be moved to end
      const taxBreakup = result![0]!.interTaxBreakup || [];
      // Should have at least one tax (GST)
      expect(taxBreakup.length).toBeGreaterThanOrEqual(1);
      // If compound tax exists, it should be at the end
      const compoundTaxes = taxBreakup.filter(t => t.compound);
      if (compoundTaxes.length > 0) {
        expect(taxBreakup[taxBreakup.length - 1]!.compound).toBe(true);
      }
      // Check that compoundInter is populated
      expect(result![0]!.compoundInter).toBeDefined();
    });

    it("should not update hsnDetails if not found in productDetailArr", () => {
      const existingProduct = {
        ...mockExistingProductWithHsn,
      };
      const result = setTaxDetails(
        [existingProduct],
        [{ productId: "different-id" }],
        true,
        false
      );

      // Should keep existing hsnDetails
      expect(result![0]!.hsnDetails).toBeDefined();
    });

    it("should handle products without matching productDetail", () => {
      const productWithoutHsn = {
        productId: "prod-1",
        // No hsnDetails
      };
      const result = setTaxDetails(
        [productWithoutHsn],
        [{ productId: "different-id" }],
        true,
        false
      );

      // When no hsnDetails, tax should be 0
      expect(result![0]!.tax).toBe(0);
      expect(result![0]!.totalInterTax).toBe(0);
    });

    it("should handle empty taxReqLs arrays", () => {
      const productDetail = {
        productId: "prod-1",
        hsnDetails: {
          tax: 10,
          interTax: {
            totalTax: 10,
            taxReqLs: [],
          },
          intraTax: {
            totalTax: 8,
            taxReqLs: [],
          },
        },
      };

      const result = setTaxDetails(
        [mockExistingProduct],
        [productDetail],
        true,
        false
      );

      expect(result![0]!.interTaxBreakup).toEqual([]);
      expect(result![0]!.intraTaxBreakup).toEqual([]);
    });

    it("should handle multiple products", () => {
      const products = [{ productId: "prod-1" }, { productId: "prod-2" }];
      const productDetails = [
        mockProductDetail,
        {
          ...mockProductDetail,
          productId: "prod-2",
        },
      ];

      const result = setTaxDetails(products, productDetails, true, false);

      expect(result?.length).toBe(2);
      expect(result![0]!.tax).toBe(10);
      expect(result![1]!.tax).toBe(10);
    });

    it("should preserve existing hsnDetails when not in productDetailArr", () => {
      const existingProduct = {
        ...mockExistingProductWithHsn,
      };
      const originalHsnDetails = existingProduct.hsnDetails;

      const result = setTaxDetails([existingProduct], [], true, false);

      // Should use existing hsnDetails
      expect(result![0]!.hsnDetails).toBe(originalHsnDetails);
    });
  });
});
