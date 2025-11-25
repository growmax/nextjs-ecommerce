import {
  checkIsBundleProduct,
  formBundleProductsPayload,
  prepareQuoteSubmissionDTO,
} from "@/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO";
import {
  mockOverviewValues,
  mockProduct,
  mockProductNew,
  mockProductPriceNotAvailable,
  mockProductWithAccountOwner,
  mockProductWithBundle,
  mockProductWithBusinessUnit,
  mockProductWithDiscount,
  mockProductWithDivision,
  mockProductWithTaxes,
  mockProductWithVolumeDiscount,
  mockProductWithWarehouse,
  mockProductWithoutShowPrice,
  mockValues,
  mockVDDetails,
} from "@/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO.mocks";

// Note: window.location.origin is used in the function
// In Jest with jsdom, it will use the actual test environment origin

describe("quoteSubmissionDTO utilities", () => {
  describe("formBundleProductsPayload", () => {
    it("should convert bundleSelected and isBundleSelected_fe to 1 or 0", () => {
      const bundles = [
        { bundleSelected: 1, isBundleSelected_fe: 1 },
        { bundleSelected: 0, isBundleSelected_fe: 0 },
        { bundleSelected: 5, isBundleSelected_fe: 10 },
      ];
      const result = formBundleProductsPayload(bundles);
      // First bundle should be selected
      expect(result[0].bundleSelected).toBe(1);
      expect(result[0].isBundleSelected_fe).toBe(1);
      // Second bundle is filtered out (isBundleSelected_fe is 0)
      // Third bundle should be selected
      expect(result[1].bundleSelected).toBe(1);
      expect(result[1].isBundleSelected_fe).toBe(1);
    });

    it("should filter out bundles where isBundleSelected_fe is falsy", () => {
      const bundles = [
        { bundleSelected: 1, isBundleSelected_fe: 1 },
        { bundleSelected: 0, isBundleSelected_fe: 0 },
        { bundleSelected: 1, isBundleSelected_fe: 1 },
      ];
      const result = formBundleProductsPayload(bundles);
      expect(result).toHaveLength(2);
      expect(result.every(bp => bp.isBundleSelected_fe === 1)).toBe(true);
    });

    it("should handle empty array", () => {
      const result = formBundleProductsPayload([]);
      expect(result).toEqual([]);
    });

    it("should handle undefined isBundleSelected_fe", () => {
      const bundles = [
        { bundleSelected: 1, isBundleSelected_fe: undefined },
        { bundleSelected: 1, isBundleSelected_fe: 1 },
      ];
      const result = formBundleProductsPayload(bundles);
      expect(result).toHaveLength(1);
    });
  });

  describe("checkIsBundleProduct", () => {
    it("should return true when bundle products have bundleSelected", () => {
      const bundles = [{ bundleSelected: 1 }, { bundleSelected: 0 }];
      expect(checkIsBundleProduct(bundles)).toBe(true);
    });

    it("should return false when no bundle products have bundleSelected", () => {
      const bundles = [{ bundleSelected: 0 }, { bundleSelected: 0 }];
      expect(checkIsBundleProduct(bundles)).toBe(false);
    });

    it("should return false for empty array", () => {
      expect(checkIsBundleProduct([])).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(checkIsBundleProduct(undefined)).toBe(false);
    });

    it("should return false for null", () => {
      expect(checkIsBundleProduct(null as any)).toBe(false);
    });
  });

  describe("prepareQuoteSubmissionDTO", () => {
    it("should create DTO with basic values", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);

      expect(result).toBeDefined();
      expect(result.versionCreatedTimestamp).toBeDefined();
      expect(typeof result.domainURL).toBe("string");
      expect(result.uploadedDocumentDetails).toEqual([]);
    });

    it("should set versionCreatedTimestamp", () => {
      const before = new Date().toISOString();
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);
      const after = new Date().toISOString();

      expect(result.versionCreatedTimestamp).toBeDefined();
      expect(
        result.versionCreatedTimestamp >= before &&
          result.versionCreatedTimestamp <= after
      ).toBe(true);
    });

    it("should set domainURL from window.location.origin", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);

      expect(typeof result.domainURL).toBe("string");
      expect(result.domainURL).toBeDefined();
    });

    it("should set modifiedByUsername from displayName", () => {
      const result = prepareQuoteSubmissionDTO(
        mockValues,
        mockOverviewValues,
        "John Doe"
      );

      expect(result.modifiedByUsername).toBe("John Doe");
    });

    it("should set modifiedByUsername to empty string when displayName is not provided", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);

      expect(result.modifiedByUsername).toBe("");
    });

    it("should set quoteName from values or overviewValues", () => {
      const result1 = prepareQuoteSubmissionDTO(
        { ...mockValues, quoteName: "Values Quote" },
        mockOverviewValues
      );
      expect(result1.quoteName).toBe("Values Quote");

      const result2 = prepareQuoteSubmissionDTO(
        { ...mockValues, quoteName: undefined },
        { ...mockOverviewValues, quoteName: "Overview Quote" }
      );
      expect(result2.quoteName).toBe("Overview Quote");
    });

    it("should set comment from overviewValues", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        comment: "Test comment",
      });

      expect(result.comment).toBe("Test comment");
    });

    it("should trim and handle empty comment", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        comment: "   ",
      });

      expect(result.comment).toBeNull();
    });

    it("should set buyerReferenceNumber from overviewValues", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        buyerReferenceNumber: "REF-123",
      });

      expect(result.buyerReferenceNumber).toBe("REF-123");
    });

    it("should set buyerReferenceNumber to null when not provided", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {});

      expect(result.buyerReferenceNumber).toBeNull();
    });

    it("should map quote users correctly", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        quoteUsers: [{ id: 1 }, { userId: 2 }, 3],
      });

      expect(result.quoteUsers).toEqual([1, 2, 3]);
      expect(result.deletableQuoteUsers).toEqual([]);
    });

    it("should handle quoteDivisionId as object", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        quoteDivisionId: { id: 5 },
      });

      expect(result.quoteDivisionId).toBe(5);
    });

    it("should handle quoteDivisionId as number", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        quoteDivisionId: 5,
      });

      expect(result.quoteDivisionId).toBe(5);
    });

    it("should handle orderType as object", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        orderType: { id: 2 },
      });

      expect(result.orderTypeId).toBe(2);
    });

    it("should handle orderType as number", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        orderType: "2",
      });

      expect(result.orderTypeId).toBe(2);
    });

    it("should map tags correctly", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        tagsList: [{ id: 1 }, { id: 2 }, 3],
      });

      expect(result.tagsList).toEqual([1, 2, 3]);
      expect(result.deletableTagsList).toEqual([]);
    });

    it("should set branchBusinessUnit from values", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);

      expect(result.branchBusinessUnit).toBe(1);
      expect(result.branchBusinessUnitId).toBe(1);
    });

    it("should handle branchBusinessUnit as number", () => {
      const result = prepareQuoteSubmissionDTO(
        { ...mockValues, branchBusinessUnit: 5 },
        mockOverviewValues
      );

      expect(result.branchBusinessUnit).toBe(5);
      expect(result.branchBusinessUnitId).toBe(5);
    });

    it("should set buyerCurrencyId from values", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);

      expect(result.buyerCurrencyId).toBe(1);
      expect(result.buyerCurrency).toEqual({ id: 1 });
    });

    it("should handle buyerCurrencyId as number", () => {
      const result = prepareQuoteSubmissionDTO(
        { ...mockValues, buyerCurrencyId: 2 },
        mockOverviewValues
      );

      expect(result.buyerCurrencyId).toBe(2);
      expect(result.buyerCurrency).toBe(2);
    });

    it("should set payerCode and payerBranchName from registerAddressDetails", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);

      expect(result.payerCode).toBe("SOLD001");
      expect(result.payerBranchName).toBe("Main Branch");
    });

    it("should set payerCode and payerBranchName to null when not available", () => {
      const result = prepareQuoteSubmissionDTO(
        { ...mockValues, registerAddressDetails: {} },
        mockOverviewValues
      );

      expect(result.payerCode).toBeNull();
      expect(result.payerBranchName).toBeNull();
    });

    it("should calculate financial values from cartValue when VDapplied is false", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);

      expect(result.subTotal).toBe(1000);
      expect(result.overallTax).toBe(100);
      expect(result.taxableAmount).toBe(900);
      expect(result.calculatedTotal).toBe(1100);
      expect(result.grandTotal).toBe(1100);
      expect(result.overallShipping).toBe(50);
      expect(result.totalPfValue).toBe(5);
    });

    it("should calculate financial values from VDDetails when VDapplied is true", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          VDapplied: true,
          VDDetails: mockVDDetails,
        },
        mockOverviewValues
      );

      expect(result.subTotal).toBe(900);
      expect(result.subTotalWithVD).toBe(800);
      expect(result.overallTax).toBe(90);
      expect(result.taxableAmount).toBe(810);
      expect(result.calculatedTotal).toBe(990);
      expect(result.grandTotal).toBe(1000);
    });

    it("should set versionLevelVolumeDisscount based on product details", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductWithVolumeDiscount],
        },
        mockOverviewValues
      );

      expect(result.versionLevelVolumeDisscount).toBe(true);
    });

    it("should format product details with accountOwner", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductWithAccountOwner],
        },
        mockOverviewValues
      );

      const product = result.dbProductDetails[0] as any;
      expect(product.accountOwnerId).toBe(1);
    });

    it("should format product details with businessUnit", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductWithBusinessUnit],
        },
        mockOverviewValues
      );

      const product = result.dbProductDetails[0] as any;
      expect(product.businessUnitId).toBe(1);
    });

    it("should format product details with division", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductWithDivision],
        },
        mockOverviewValues
      );

      const product = result.dbProductDetails[0] as any;
      expect(product.divisionId).toBe(1);
    });

    it("should format product details with warehouse", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductWithWarehouse],
        },
        mockOverviewValues
      );

      const product = result.dbProductDetails[0] as any;
      expect(product.orderWareHouseId).toBe(1);
      expect(product.orderWareHouseName).toBe("Warehouse 1");
    });

    it("should set lineNo and itemNo to null for new products", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductNew],
        },
        mockOverviewValues
      );

      const product = result.dbProductDetails[0] as any;
      expect(product.lineNo).toBeNull();
      expect(product.itemNo).toBeNull();
    });

    it("should set productTaxes based on isInter flag", () => {
      const resultInter = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          isInter: true,
          dbProductDetails: [mockProductWithTaxes],
        },
        mockOverviewValues
      );

      const resultIntra = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          isInter: false,
          dbProductDetails: [mockProductWithTaxes],
        },
        mockOverviewValues
      );

      const productInter = resultInter.dbProductDetails[0] as any;
      const productIntra = resultIntra.dbProductDetails[0] as any;

      expect(productInter.productTaxes).toEqual([{ taxId: 1, amount: 10 }]);
      expect(productIntra.productTaxes).toEqual([{ taxId: 2, amount: 20 }]);
    });

    it("should map productDiscounts when discountId exists", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductWithDiscount],
        },
        mockOverviewValues
      );

      const product = result.dbProductDetails[0] as any;
      expect(product.productDiscounts).toHaveLength(1);
      expect(product.productDiscounts[0]).toMatchObject({
        discounId: "disc-1",
        discountPercentage: 10,
      });
    });

    it("should map bundleProducts", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductWithBundle],
        },
        mockOverviewValues
      );

      const product = result.dbProductDetails[0] as any;
      expect(product.bundleProducts).toHaveLength(2);
    });

    it("should set unitListPrice based on showPrice and priceNotAvailable", () => {
      const result1 = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductWithoutShowPrice],
        },
        mockOverviewValues
      );

      const result2 = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductPriceNotAvailable],
        },
        mockOverviewValues
      );

      const product1 = result1.dbProductDetails[0] as any;
      const product2 = result2.dbProductDetails[0] as any;

      // When showPrice is false or priceNotAvailable is true, use unitLPRp or unitListPrice
      expect(product1.unitListPrice).toBe(95);
      expect(product2.unitListPrice).toBe(95);
    });

    it("should set showPrice correctly", () => {
      const result1 = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProduct],
        },
        mockOverviewValues
      );

      const result2 = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          dbProductDetails: [mockProductPriceNotAvailable],
        },
        mockOverviewValues
      );

      const product1 = result1.dbProductDetails[0] as any;
      const product2 = result2.dbProductDetails[0] as any;

      expect(product1.showPrice).toBe(true);
      expect(product2.showPrice).toBe(false);
    });

    it("should include removedDbProductDetails in dbProductDetails", () => {
      const removedProduct = { ...mockProduct, productId: "removed-1" };
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          removedDbProductDetails: [removedProduct],
        },
        mockOverviewValues
      );

      expect(result.dbProductDetails).toHaveLength(2);
    });

    it("should set pfPercentage and pfValue from quoteTerms or pfRate", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);

      const product = result.dbProductDetails[0] as any;
      // pfPercentage prioritizes: quoteTerms.pfPercentage || pfRate || prod.pfPercentage
      expect(product.pfPercentage).toBe(5); // From quoteTerms.pfPercentage
      // pfValue prioritizes: quoteTerms.pfValue || pfRate || prod.pfValue
      expect(product.pfValue).toBe(50); // From quoteTerms.pfValue (not pfRate)
    });

    it("should preserve all existing fields from values", () => {
      const customValues = {
        ...mockValues,
        customField: "custom value",
        anotherField: 123,
      };
      const result = prepareQuoteSubmissionDTO(
        customValues,
        mockOverviewValues
      );

      expect((result as any).customField).toBe("custom value");
      expect((result as any).anotherField).toBe(123);
    });

    it("should handle empty arrays for quoteUsers and tagsList", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, {
        ...mockOverviewValues,
        quoteUsers: [],
        tagsList: [],
      });

      expect(result.quoteUsers).toEqual([]);
      expect(result.tagsList).toEqual([]);
    });

    it("should handle subtotal_bc", () => {
      const result = prepareQuoteSubmissionDTO(
        {
          ...mockValues,
          subtotal_bc: "100",
        },
        mockOverviewValues
      );

      expect(result.subtotal_bc).toBe("100");
    });

    it("should set subtotal_bc to null when not provided", () => {
      const result = prepareQuoteSubmissionDTO(mockValues, mockOverviewValues);

      expect(result.subtotal_bc).toBeNull();
    });
  });
});
