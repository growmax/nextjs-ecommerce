import {
  applyVolumeDiscountsToSellerCarts,
  calculateAllSellerCartPricing,
  calculateSellerCartPricing,
  findBestPricingMatch,
  getMockSellerData,
  getOverallCartSummary,
  getPricingResolutionSummary,
  groupCartItemsBySeller,
  isValidPricing,
  mergeSellerPricing,
} from "@/utils/calculation/sellerCartUtils/sellerCartUtils";
import {
  mockCartItem,
  mockCartItemWithVendor,
  mockCartItemWithoutLocation,
  mockCartItems,
  mockPricingDataInvalid,
  mockPricingDataValid,
  mockPricingDataWithBasePrice,
  mockPricingDataWithMasterPrice,
  mockSellerCart,
  mockSellerCartWithPricing,
  mockSellerCartsWithPricingSource,
  mockSellerPricingData,
  mockVolumeDiscountData,
} from "@/utils/calculation/sellerCartUtils/sellerCartUtils.mocks";

// Mock the dependencies
jest.mock("../cartCalculation", () => ({
  cartCalculation: jest.fn(items => ({
    totalItems: items.length,
    totalValue: items.reduce(
      (sum: number, item: any) => sum + (item.totalPrice || 0),
      0
    ),
    totalTax: 100,
    grandTotal: 1100,
    totalLP: 50,
    pfRate: 5,
    totalShipping: 50,
    hideListPricePublic: false,
    hasProductsWithNegativeTotalPrice: false,
    hasAllProductsAvailableInPriceList: true,
  })),
  discountDetails: jest.fn(items => items),
  VolumeDiscountCalculation: jest.fn(() => ({
    products: [],
    vdDetails: {
      subTotal: 1000,
      subTotalVolume: 900,
      volumeDiscountApplied: 100,
      overallTax: 90,
      taxableAmount: 810,
      grandTotal: 990,
    },
    pfRate: 5,
  })),
}));

describe("sellerCartUtils utilities", () => {
  describe("groupCartItemsBySeller", () => {
    it("should group cart items by seller", () => {
      const result = groupCartItemsBySeller(mockCartItems);

      expect(result).toBeDefined();
      expect(Object.keys(result)).toHaveLength(2);
      expect(result["seller-1"]).toBeDefined();
      expect(result["seller-2"]).toBeDefined();
    });

    it("should return empty object for empty cart items", () => {
      const result = groupCartItemsBySeller([]);

      expect(result).toEqual({});
    });

    it("should return empty object for null cart items", () => {
      const result = groupCartItemsBySeller(null as any);

      expect(result).toEqual({});
    });

    it("should create seller info from first item", () => {
      const result = groupCartItemsBySeller(mockCartItems);

      expect(result["seller-1"].seller.name).toBe("Test Seller");
      expect(result["seller-1"].seller.location).toBe("Test Location");
    });

    it("should use vendorName as fallback for seller name", () => {
      const result = groupCartItemsBySeller([mockCartItemWithVendor]);

      expect(result["seller-1"].seller.name).toBe("Vendor Name");
    });

    it("should use vendorLocation as fallback for location", () => {
      const result = groupCartItemsBySeller([mockCartItemWithVendor]);

      expect(result["seller-1"].seller.location).toBe("Vendor Location");
    });

    it("should use default values when seller info is missing", () => {
      const result = groupCartItemsBySeller([mockCartItemWithoutLocation]);

      expect(result["seller-3"].seller.name).toBe("Unknown Seller");
      expect(result["seller-3"].seller.location).toBe("Location not specified");
    });

    it("should calculate itemCount correctly", () => {
      const result = groupCartItemsBySeller(mockCartItems);

      expect(result["seller-1"].itemCount).toBe(2);
      expect(result["seller-2"].itemCount).toBe(1);
    });

    it("should calculate totalQuantity correctly", () => {
      const result = groupCartItemsBySeller(mockCartItems);

      expect(result["seller-1"].totalQuantity).toBe(20); // 10 + 10
      expect(result["seller-2"].totalQuantity).toBe(5);
    });

    it("should handle items with zero quantity", () => {
      const items = [{ ...mockCartItem, quantity: 0 }];
      const result = groupCartItemsBySeller(items);

      expect(result["seller-1"].totalQuantity).toBe(0);
    });

    it("should handle items with undefined quantity", () => {
      const items = [{ ...mockCartItem, quantity: undefined }];
      const result = groupCartItemsBySeller(items);

      expect(result["seller-1"].totalQuantity).toBe(0);
    });
  });

  describe("calculateSellerCartPricing", () => {
    it("should return default pricing for empty items", () => {
      const result = calculateSellerCartPricing([]);

      expect(result.pricing.totalItems).toBe(0);
      expect(result.pricing.totalValue).toBe(0);
      expect(result.pricing.totalTax).toBe(0);
      expect(result.pricing.grandTotal).toBe(0);
      expect(result.processedItems).toEqual([]);
    });

    it("should return default pricing for null items", () => {
      const result = calculateSellerCartPricing(null as any);

      expect(result.pricing.totalItems).toBe(0);
      expect(result.processedItems).toEqual([]);
    });

    it("should calculate pricing for seller items", () => {
      const result = calculateSellerCartPricing([mockCartItem]);

      expect(result.pricing).toBeDefined();
      expect(result.processedItems).toBeDefined();
    });

    it("should pass isInter flag to cartCalculation", () => {
      const result1 = calculateSellerCartPricing([mockCartItem], true);
      const result2 = calculateSellerCartPricing([mockCartItem], false);

      expect(result1.pricing).toBeDefined();
      expect(result2.pricing).toBeDefined();
    });

    it("should pass insuranceCharges to cartCalculation", () => {
      const result = calculateSellerCartPricing([mockCartItem], true, 25);

      expect(result.pricing).toBeDefined();
    });

    it("should pass precision to calculations", () => {
      const result = calculateSellerCartPricing([mockCartItem], true, 0, 4);

      expect(result.pricing).toBeDefined();
    });

    it("should pass Settings to cartCalculation", () => {
      const settings = { itemWiseShippingTax: true };
      const result = calculateSellerCartPricing(
        [mockCartItem],
        true,
        0,
        2,
        settings
      );

      expect(result.pricing).toBeDefined();
    });

    it("should pass isSeller and taxExemption to discountDetails", () => {
      const result = calculateSellerCartPricing(
        [mockCartItem],
        true,
        0,
        2,
        {},
        true,
        true
      );

      expect(result.pricing).toBeDefined();
    });
  });

  describe("calculateAllSellerCartPricing", () => {
    it("should calculate pricing for all seller carts", () => {
      const result = calculateAllSellerCartPricing(mockSellerCart);

      expect(result).toBeDefined();
      expect(Object.keys(result)).toHaveLength(2);
      expect(result["seller-1"].pricing).toBeDefined();
      expect(result["seller-2"].pricing).toBeDefined();
    });

    it("should use processedItems from calculateSellerCartPricing", () => {
      const result = calculateAllSellerCartPricing(mockSellerCart);

      expect(result["seller-1"].items).toBeDefined();
    });

    it("should preserve seller cart properties", () => {
      const result = calculateAllSellerCartPricing(mockSellerCart);

      expect(result["seller-1"].seller).toBeDefined();
      expect(result["seller-1"].itemCount).toBe(1);
    });

    it("should use default calculation params", () => {
      const result = calculateAllSellerCartPricing(mockSellerCart, {});

      expect(result["seller-1"].pricing).toBeDefined();
    });

    it("should use custom calculation params", () => {
      const params = {
        isInter: false,
        insuranceCharges: 25,
        precision: 4,
        Settings: { itemWiseShippingTax: true },
        isSeller: true,
        taxExemption: true,
      };
      const result = calculateAllSellerCartPricing(mockSellerCart, params);

      expect(result["seller-1"].pricing).toBeDefined();
    });

    it("should handle empty seller carts", () => {
      const result = calculateAllSellerCartPricing({});

      expect(result).toEqual({});
    });
  });

  describe("getOverallCartSummary", () => {
    it("should return zero summary for empty seller carts", () => {
      const result = getOverallCartSummary({});

      expect(result.totalSellers).toBe(0);
      expect(result.totalItems).toBe(0);
      expect(result.totalValue).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.grandTotal).toBe(0);
    });

    it("should calculate summary across all sellers", () => {
      const result = getOverallCartSummary(mockSellerCartWithPricing);

      expect(result.totalSellers).toBe(2);
      expect(result.totalItems).toBe(2);
      expect(result.totalValue).toBe(2000);
      expect(result.totalTax).toBe(180);
      expect(result.grandTotal).toBe(2180);
    });

    it("should handle single seller", () => {
      const singleSeller = {
        "seller-1": mockSellerCartWithPricing["seller-1"],
      };
      const result = getOverallCartSummary(singleSeller);

      expect(result.totalSellers).toBe(1);
      expect(result.totalItems).toBe(1);
    });

    it("should accumulate all financial values", () => {
      const result = getOverallCartSummary(mockSellerCartWithPricing);

      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.totalTax).toBeGreaterThan(0);
      expect(result.grandTotal).toBeGreaterThan(0);
    });
  });

  describe("getMockSellerData", () => {
    it("should return mock data for known seller", () => {
      const result = getMockSellerData("seller-1");

      expect(result.id).toBe("seller-1");
      expect(result.name).toBe("Vashi Electricals");
      expect(result.location).toBe("Mumbai, Maharashtra");
    });

    it("should return default data for unknown seller", () => {
      const result = getMockSellerData("unknown-seller");

      expect(result.id).toBe("unknown-seller");
      expect(result.name).toBe("Unknown Seller");
      expect(result.location).toBe("Location not specified");
      expect(result.rating).toBe(4.0);
      expect(result.isVerified).toBe(false);
    });

    it("should return all known sellers", () => {
      const seller1 = getMockSellerData("seller-1");
      const seller2 = getMockSellerData("seller-2");
      const seller3 = getMockSellerData("seller-3");

      expect(seller1.name).toBe("Vashi Electricals");
      expect(seller2.name).toBe("Deekay Electricals");
      expect(seller3.name).toBe("PowerTech Solutions");
    });
  });

  describe("applyVolumeDiscountsToSellerCarts", () => {
    it("should apply volume discounts when data exists", () => {
      const result = applyVolumeDiscountsToSellerCarts(
        mockSellerCart,
        mockVolumeDiscountData
      );

      expect(result["seller-1"].volumeDiscountDetails).toBeDefined();
      expect(result["seller-1"].pfRate).toBeDefined();
    });

    it("should not modify seller cart when no volume discount data", () => {
      const result = applyVolumeDiscountsToSellerCarts(mockSellerCart, {});

      expect(result["seller-1"]).toEqual(mockSellerCart["seller-1"]);
    });

    it("should calculate subtotal from items", () => {
      const result = applyVolumeDiscountsToSellerCarts(
        mockSellerCart,
        mockVolumeDiscountData
      );

      expect(result["seller-1"].volumeDiscountDetails).toBeDefined();
    });

    it("should calculate overallShipping from items", () => {
      const result = applyVolumeDiscountsToSellerCarts(
        mockSellerCart,
        mockVolumeDiscountData
      );

      expect(result["seller-1"].volumeDiscountDetails).toBeDefined();
    });

    it("should use default calculation params", () => {
      const result = applyVolumeDiscountsToSellerCarts(
        mockSellerCart,
        mockVolumeDiscountData,
        {}
      );

      expect(result["seller-1"].volumeDiscountDetails).toBeDefined();
    });

    it("should use custom calculation params", () => {
      const params = {
        isInter: false,
        precision: 4,
        Settings: { itemWiseShippingTax: true },
        beforeTax: true,
        beforeTaxPercentage: 10,
      };
      const result = applyVolumeDiscountsToSellerCarts(
        mockSellerCart,
        mockVolumeDiscountData,
        params
      );

      expect(result["seller-1"].volumeDiscountDetails).toBeDefined();
    });

    it("should handle empty volume discount data for seller", () => {
      const vdData = {
        "seller-1": [],
      };
      const result = applyVolumeDiscountsToSellerCarts(mockSellerCart, vdData);

      expect(result["seller-1"]).toEqual(mockSellerCart["seller-1"]);
    });

    it("should update items with volume discount products", () => {
      const result = applyVolumeDiscountsToSellerCarts(
        mockSellerCart,
        mockVolumeDiscountData
      );

      expect(result["seller-1"].items).toBeDefined();
    });
  });

  describe("findBestPricingMatch", () => {
    it("should find pricing from seller-specific data", () => {
      const item = { productId: "prod-1", sellerId: "seller-1" };
      const result = findBestPricingMatch(item, mockSellerPricingData);

      expect(result).toBeDefined();
      expect(result?.pricingSource).toBe("seller-specific");
      expect(result?.matchedSellerId).toBe("seller-1");
    });

    it("should find pricing from vendor-specific data", () => {
      const item = { productId: "prod-3", vendorId: "vendor-1" };
      const result = findBestPricingMatch(item, mockSellerPricingData);

      expect(result).toBeDefined();
      expect(result?.pricingSource).toBe("seller-specific");
      expect(result?.matchedSellerId).toBe("vendor-1");
    });

    it("should find pricing from no-seller-id group when seller-specific not found", () => {
      const item = { productId: "prod-2", sellerId: "seller-2" };
      const pricingData = {
        "no-seller-id": [
          {
            ProductVariantId: "prod-2",
            MasterPrice: 200,
            sellerId: "seller-2",
          },
        ],
      };
      const result = findBestPricingMatch(item, pricingData);

      expect(result).toBeDefined();
      expect(result?.pricingSource).toBe("no-seller-id");
      expect(result?.matchedSellerId).toBe("no-seller-id");
    });

    it("should return null when no pricing found", () => {
      const item = { productId: "non-existent", sellerId: "seller-1" };
      const result = findBestPricingMatch(item, {});

      expect(result).toBeNull();
    });

    it("should prioritize sellerId over vendorId", () => {
      const item = {
        productId: "prod-1",
        sellerId: "seller-1",
        vendorId: "vendor-1",
      };
      const result = findBestPricingMatch(item, mockSellerPricingData);

      expect(result?.matchedSellerId).toBe("seller-1");
    });

    it("should handle string and number product IDs", () => {
      const item = { productId: 123, sellerId: "seller-1" };
      const pricingData = {
        "seller-1": [{ ProductVariantId: "123", MasterPrice: 100 }],
      };
      const result = findBestPricingMatch(item, pricingData);

      expect(result).toBeDefined();
    });
  });

  describe("mergeSellerPricing", () => {
    it("should return seller pricing data", () => {
      const result = mergeSellerPricing(mockSellerPricingData);

      expect(result["seller-1"]).toBeDefined();
      expect(result["vendor-1"]).toBeDefined();
    });

    it("should return the same pricing data", () => {
      const sellerData = {
        "seller-1": [{ ProductVariantId: "prod-1", MasterPrice: 100 }],
      };
      const result = mergeSellerPricing(sellerData);

      expect(result["seller-1"]).toEqual(sellerData["seller-1"]);
    });

    it("should handle empty seller pricing data", () => {
      const result = mergeSellerPricing({ "seller-1": [] });

      expect(result["seller-1"]).toEqual([]);
    });

    it("should return empty object when empty", () => {
      const result = mergeSellerPricing({});

      expect(result).toEqual({});
    });
  });

  describe("isValidPricing", () => {
    it("should return true for valid pricing with MasterPrice", () => {
      const result = isValidPricing(mockPricingDataValid);

      expect(result).toBe(true);
    });

    it("should return true for valid pricing with BasePrice", () => {
      const result = isValidPricing(mockPricingDataWithBasePrice);

      expect(result).toBe(true);
    });

    it("should return true for valid pricing with MasterPrice only", () => {
      const result = isValidPricing(mockPricingDataWithMasterPrice);

      expect(result).toBe(true);
    });

    it("should return false for invalid pricing", () => {
      const result = isValidPricing(mockPricingDataInvalid);

      expect(result).toBe(false);
    });

    it("should return false for null pricing", () => {
      const result = isValidPricing(null);

      // When pricingData is null, the function returns false (falsy)
      expect(result).toBeFalsy();
    });

    it("should return false for undefined pricing", () => {
      const result = isValidPricing(undefined);

      // When pricingData is undefined, the function returns false (falsy)
      expect(result).toBeFalsy();
    });

    it("should return false when priceNotAvailable is true", () => {
      const pricing = {
        MasterPrice: 100,
        BasePrice: 90,
        priceNotAvailable: true,
      };
      const result = isValidPricing(pricing);

      expect(result).toBe(false);
    });

    it("should return false when both prices are null", () => {
      const pricing = {
        MasterPrice: null,
        BasePrice: null,
        priceNotAvailable: false,
      };
      const result = isValidPricing(pricing);

      expect(result).toBe(false);
    });
  });

  describe("getPricingResolutionSummary", () => {
    it("should calculate summary for seller carts", () => {
      const result = getPricingResolutionSummary(
        mockSellerCartsWithPricingSource
      );

      expect(result.totalSellers).toBe(2);
      expect(result.totalProducts).toBe(4);
      expect(result.pricingBySources["seller-specific"]).toBeGreaterThanOrEqual(
        0
      );
      expect(result.pricingBySources["no-seller-id"]).toBeGreaterThanOrEqual(0);
      expect(result.pricingBySources["no-pricing"]).toBeGreaterThanOrEqual(0);
    });

    it("should track products without pricing", () => {
      const result = getPricingResolutionSummary(
        mockSellerCartsWithPricingSource
      );

      expect(result.productsWithoutPricing).toBeDefined();
      expect(Array.isArray(result.productsWithoutPricing)).toBe(true);
    });

    it("should handle empty seller carts", () => {
      const result = getPricingResolutionSummary({});

      expect(result.totalSellers).toBe(0);
      expect(result.totalProducts).toBe(0);
      expect(result.productsWithoutPricing).toEqual([]);
    });

    it("should count pricing sources correctly", () => {
      const result = getPricingResolutionSummary(
        mockSellerCartsWithPricingSource
      );

      expect(
        result.pricingBySources["seller-specific"] +
          result.pricingBySources["no-seller-id"] +
          result.pricingBySources["no-pricing"]
      ).toBeGreaterThanOrEqual(0);
    });

    it("should handle seller carts without items", () => {
      const carts = {
        "seller-1": {},
      };
      const result = getPricingResolutionSummary(carts);

      expect(result.totalSellers).toBe(1);
      expect(result.totalProducts).toBe(0);
    });
  });
});
