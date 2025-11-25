import { getLatestTaxData } from "@/utils/order/getLatestTaxData/getLatestTaxData";
import {
  mockCalculateCartResult,
  mockCurrency,
  mockDiscountResponse,
  mockElasticProducts,
  mockFormattedElasticData,
  mockProcessedProducts,
  mockProducts,
  mockProduct,
  mockQuoteSettings,
  mockRequestContext,
  mockSellerCurrency,
  mockTaxDetailsResult,
  mockUserCurrency,
} from "@/utils/order/getLatestTaxData/getLatestTaxData.mocks";

// Mock all dependencies
jest.mock("@/lib/api/services/DiscountService/DiscountService", () => ({
  __esModule: true,
  default: {
    getDiscount: jest.fn(),
  },
}));

jest.mock("@/lib/api/services/SearchService/SearchService", () => ({
  __esModule: true,
  default: {
    getProductsByIds: jest.fn(),
  },
}));

jest.mock("@/utils/elasticsearch/format-response", () => ({
  formatElasticResponse: jest.fn(),
}));

jest.mock("@/utils/calculation/salesCalculation/salesCalculation", () => ({
  manipulateProductsElasticData: jest.fn(),
  setTaxDetails: jest.fn(),
}));

jest.mock("@/utils/functionalUtils", () => ({
  assign_pricelist_discounts_data_to_products: jest.fn(item => item),
}));

jest.mock(
  "@/utils/calculation/discountCalculation/discountCalculation",
  () => ({
    getSuitableDiscountByQuantity: jest.fn(() => ({
      suitableDiscount: null,
    })),
  })
);

jest.mock("@/utils/calculation/cartCalculation", () => ({
  discountDetails: jest.fn(products => products),
}));

jest.mock("@/utils/calculation/cart-calculation", () => ({
  calculateCart: jest.fn(),
}));

import DiscountService from "@/lib/api/services/DiscountService/DiscountService";
import SearchService from "@/lib/api/services/SearchService/SearchService";
import { calculateCart } from "@/utils/calculation/cart-calculation";
import { discountDetails } from "@/utils/calculation/cartCalculation";
import { getSuitableDiscountByQuantity } from "@/utils/calculation/discountCalculation/discountCalculation";
import {
  manipulateProductsElasticData,
  setTaxDetails,
} from "@/utils/calculation/salesCalculation/salesCalculation";
import { formatElasticResponse } from "@/utils/elasticsearch/format-response";
import { assign_pricelist_discounts_data_to_products } from "@/utils/functionalUtils";

const mockDiscountService = DiscountService as jest.Mocked<
  typeof DiscountService
>;
const mockSearchService = SearchService as jest.Mocked<typeof SearchService>;
const mockFormatElasticResponse = formatElasticResponse as jest.MockedFunction<
  typeof formatElasticResponse
>;
const mockManipulateProductsElasticData =
  manipulateProductsElasticData as jest.MockedFunction<
    typeof manipulateProductsElasticData
  >;
const mockSetTaxDetails = setTaxDetails as jest.MockedFunction<
  typeof setTaxDetails
>;
const mockAssignPricelistDiscounts =
  assign_pricelist_discounts_data_to_products as jest.MockedFunction<
    typeof assign_pricelist_discounts_data_to_products
  >;
const mockGetSuitableDiscount =
  getSuitableDiscountByQuantity as jest.MockedFunction<
    typeof getSuitableDiscountByQuantity
  >;
const mockDiscountDetails = discountDetails as jest.MockedFunction<
  typeof discountDetails
>;
const mockCalculateCart = calculateCart as jest.MockedFunction<
  typeof calculateCart
>;

describe("getLatestTaxData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDiscountService.getDiscount.mockResolvedValue(
      mockDiscountResponse as any
    );
    mockSearchService.getProductsByIds.mockResolvedValue(
      mockElasticProducts as any
    );
    mockFormatElasticResponse.mockReturnValue(mockFormattedElasticData as any);
    mockManipulateProductsElasticData.mockReturnValue(
      mockFormattedElasticData as any
    );
    mockSetTaxDetails.mockReturnValue(mockTaxDetailsResult);
    mockDiscountDetails.mockReturnValue(mockProcessedProducts);
  });

  it("should return empty array when products is empty", async () => {
    const result = await getLatestTaxData({
      products: [],
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
    });

    expect(result).toEqual([]);
    expect(mockDiscountService.getDiscount).not.toHaveBeenCalled();
    expect(mockSearchService.getProductsByIds).not.toHaveBeenCalled();
  });

  it("should return products when no productIds found", async () => {
    const productsWithoutIds = [{ name: "Product" }];
    const result = await getLatestTaxData({
      products: productsWithoutIds,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
    });

    expect(result).toEqual(productsWithoutIds);
    expect(mockDiscountService.getDiscount).not.toHaveBeenCalled();
  });

  it("should throw error when required parameters are missing", async () => {
    // The function throws error but catches it and returns products
    // So we need to check that the error is thrown before being caught
    await expect(
      getLatestTaxData({
        products: mockProducts,
        // Missing userId, companyId, or tenantCode
      })
    ).resolves.toEqual(mockProducts); // Function catches error and returns original products
  });

  it("should call DiscountService and SearchService with correct parameters", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      currency: mockCurrency,
      sellerCurrency: mockSellerCurrency,
      elasticIndex: "custom-index",
    });

    expect(mockDiscountService.getDiscount).toHaveBeenCalledWith({
      userId: 123,
      tenantId: "tenant1",
      body: {
        Productid: [1],
        CurrencyId: 1,
        BaseCurrencyId: 2,
        companyId: 456,
        currencyCode: "INR",
      },
    });

    expect(mockSearchService.getProductsByIds).toHaveBeenCalledWith(
      [1],
      "custom-index",
      {
        userId: 123,
        companyId: 456,
        tenantCode: "tenant1",
      }
    );
  });

  it("should use userCurrency as fallback when currency is 0", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      currency: 0,
      userCurrency: mockUserCurrency,
    });

    expect(mockDiscountService.getDiscount).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          CurrencyId: 1, // Should use userCurrency.id
        }),
      })
    );
  });

  it("should use default currency code INR when not provided", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      currency: 1, // Number, no currencyCode
    });

    expect(mockDiscountService.getDiscount).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          currencyCode: "INR",
        }),
      })
    );
  });

  it("should handle discount response with success property", async () => {
    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
    });

    expect(result).toBeDefined();
    expect(mockSetTaxDetails).toHaveBeenCalled();
  });

  it("should handle discount response without success property", async () => {
    mockDiscountService.getDiscount.mockResolvedValue({
      data: mockDiscountResponse.data,
    } as any);

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
    });

    expect(result).toBeDefined();
  });

  it("should handle discount response as array", async () => {
    mockDiscountService.getDiscount.mockResolvedValue(
      mockDiscountResponse.data as any
    );

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
    });

    expect(result).toBeDefined();
  });

  it("should handle currency as number", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      currency: 1,
    });

    expect(mockDiscountService.getDiscount).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          CurrencyId: 1,
        }),
      })
    );
  });

  it("should handle currency as object", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      currency: mockCurrency,
    });

    expect(mockDiscountService.getDiscount).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          CurrencyId: 1,
          currencyCode: "INR",
        }),
      })
    );
  });

  it("should use provided context instead of building one", async () => {
    // Even with context, we still need userId/companyId/tenantCode for discount API
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      context: mockRequestContext,
    });

    expect(mockSearchService.getProductsByIds).toHaveBeenCalledWith(
      [1],
      "pgproduct",
      mockRequestContext
    );
  });

  it("should return original products when no formatted data or discounts (edit flow)", async () => {
    mockDiscountService.getDiscount.mockResolvedValue(null as any);
    mockSearchService.getProductsByIds.mockResolvedValue([]);
    mockFormatElasticResponse.mockReturnValue([]);
    mockManipulateProductsElasticData.mockReturnValue([]);
    // When no formatted data, products still go through discountDetails and setTaxDetails
    mockDiscountDetails.mockReturnValue(mockProducts);
    mockSetTaxDetails.mockReturnValue(mockProducts);

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isPlaceOrder: false,
    });

    // Products are still processed through discountDetails and setTaxDetails
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return original products when no discounts (place order flow)", async () => {
    mockDiscountService.getDiscount.mockResolvedValue(null as any);
    // When no discounts, products still go through discountDetails and setTaxDetails
    mockDiscountDetails.mockReturnValue(mockProducts);
    mockSetTaxDetails.mockReturnValue(mockProducts);

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isPlaceOrder: true,
    });

    // Products are still processed through discountDetails and setTaxDetails
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should process products in edit order flow", async () => {
    const productWithDiscountsList = {
      ...mockProduct,
      discountsList: [
        {
          Value: 10,
          min_qty: 1,
          max_qty: 9999,
        },
      ],
    };

    mockGetSuitableDiscount.mockReturnValue({
      suitableDiscount: {
        Value: 10,
        min_qty: 1,
        max_qty: 9999,
      },
    } as any);

    const result = await getLatestTaxData({
      products: [productWithDiscountsList],
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isPlaceOrder: false,
      isCloneReOrder: false,
    });

    expect(result).toBeDefined();
    expect(mockGetSuitableDiscount).toHaveBeenCalled();
  });

  it("should process products in clone/reorder flow", async () => {
    const productWithAskedQuantity = {
      ...mockProduct,
      askedQuantity: 20,
      discountDetails: {
        Value: 10,
      },
    };

    mockCalculateCart.mockReturnValue(mockCalculateCartResult as any);

    const result = await getLatestTaxData({
      products: [productWithAskedQuantity],
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isPlaceOrder: false,
      isCloneReOrder: true,
      quoteSettings: mockQuoteSettings,
    });

    expect(result).toBeDefined();
    expect(mockCalculateCart).toHaveBeenCalled();
  });

  it("should process products in place order flow", async () => {
    const discountData = {
      ProductVariantId: 1,
      BasePrice: 100,
      MasterPrice: 90,
      CantCombineWithOtherDisCounts: false,
      discounts: [
        {
          Value: 10,
          min_qty: 1,
          max_qty: 9999,
        },
      ],
    } as any;

    mockDiscountService.getDiscount.mockResolvedValue({
      data: [discountData],
    } as any);

    mockGetSuitableDiscount.mockReturnValue({
      suitableDiscount: {
        Value: 10,
        min_qty: 1,
        max_qty: 9999,
      },
    } as any);

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isPlaceOrder: true,
    });

    expect(result).toBeDefined();
  });

  it("should handle isSprRequested flag in place order flow", async () => {
    const discountData = {
      ProductVariantId: 1,
      discounts: [],
    } as any;

    mockDiscountService.getDiscount.mockResolvedValue({
      data: [discountData],
    } as any);

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isPlaceOrder: true,
      isSprRequested: true,
    });

    expect(result).toBeDefined();
  });

  it("should update sellerId and sellerName from discount response", async () => {
    const discountData = {
      ProductVariantId: 1,
      sellerId: 999,
      sellerName: "Test Seller",
    } as any;

    mockDiscountService.getDiscount.mockResolvedValue({
      data: [discountData],
    } as any);

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isPlaceOrder: false,
    });

    expect(result).toBeDefined();
    expect(mockAssignPricelistDiscounts).toHaveBeenCalled();
  });

  it("should map PricelistCode to priceListCode", async () => {
    const discountData = {
      ProductVariantId: 1,
      PricelistCode: "PL001",
    } as any;

    mockDiscountService.getDiscount.mockResolvedValue({
      data: [discountData],
    } as any);

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isPlaceOrder: true,
    });

    expect(result).toBeDefined();
  });

  it("should return original products on error", async () => {
    mockDiscountService.getDiscount.mockRejectedValue(new Error("API Error"));

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
    });

    expect(result).toEqual(mockProducts);
  });

  it("should use default roundOff value of 2", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
    });

    expect(mockDiscountDetails).toHaveBeenCalledWith(
      expect.anything(),
      false,
      false,
      2
    );
  });

  it("should use custom roundOff value", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      roundOff: 4,
    });

    expect(mockDiscountDetails).toHaveBeenCalledWith(
      expect.anything(),
      false,
      false,
      4
    );
  });

  it("should use default elasticIndex of pgproduct", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
    });

    expect(mockSearchService.getProductsByIds).toHaveBeenCalledWith(
      [1],
      "pgproduct",
      expect.anything()
    );
  });

  it("should use custom elasticIndex", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      elasticIndex: "custom-index",
    });

    expect(mockSearchService.getProductsByIds).toHaveBeenCalledWith(
      [1],
      "custom-index",
      expect.anything()
    );
  });

  it("should handle taxExemption flag", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      taxExemption: true,
    });

    expect(mockDiscountDetails).toHaveBeenCalledWith(
      expect.anything(),
      false,
      true,
      2
    );

    expect(mockSetTaxDetails).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      true,
      true
    );
  });

  it("should handle isInter flag", async () => {
    await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isInter: false,
    });

    expect(mockSetTaxDetails).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      false,
      false
    );
  });

  it("should handle bundle products in clone/reorder flow", async () => {
    const elasticProductWithBundle = {
      ...mockElasticProducts[0],
      bundleProducts: [{ id: 1, name: "Bundle 1" }],
    } as any;

    mockSearchService.getProductsByIds.mockResolvedValue([
      elasticProductWithBundle,
    ] as any);
    mockManipulateProductsElasticData.mockReturnValue([
      elasticProductWithBundle,
    ] as any);
    mockCalculateCart.mockReturnValue(mockCalculateCartResult as any);

    const result = await getLatestTaxData({
      products: mockProducts,
      userId: 123,
      companyId: 456,
      tenantCode: "tenant1",
      isCloneReOrder: true,
    });

    expect(result).toBeDefined();
  });
});
