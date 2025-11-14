// Mocks for getLatestTaxData utility
// These mocks are for testing the utility in isolation.

export const mockProduct = {
  productId: 1,
  quantity: 10,
  unitListPrice: 100,
  discount: 0,
  discountPercentage: 0,
  askedQuantity: 10,
  packagingQuantity: 1,
  priceNotAvailable: false,
};

export const mockProducts = [mockProduct];

export const mockDiscountResponse = {
  success: true,
  data: [
    {
      ProductVariantId: 1,
      PricelistCode: "PL001",
      sellerId: 1,
      sellerName: "Seller 1",
      BasePrice: 100,
      MasterPrice: 90,
      CantCombineWithOtherDisCounts: false,
      discounts: [
        {
          Value: 10,
          MinQuantity: 1,
        },
      ],
    },
  ],
};

export const mockElasticProducts = [
  {
    productId: 1,
    taxInclusive: true,
    primary_products_categoryObjects: [],
    hsnDetails: { code: "123456" },
    listPricePublic: 100,
    showPrice: true,
    unitListPrice: 100,
    bundleProducts: [],
  },
];

export const mockFormattedElasticData = [
  {
    productId: 1,
    taxInclusive: true,
    primary_products_categoryObjects: [],
    hsnDetails: { code: "123456" },
    listPricePublic: 100,
    showPrice: true,
    unitListPrice: 100,
    bundleProducts: [],
  },
];

export const mockProcessedProducts = [
  {
    ...mockProduct,
    discountDetails: {
      Value: 10,
    },
    discount: 10,
    discountPercentage: 10,
  },
];

export const mockTaxDetailsResult = [
  {
    ...mockProduct,
    discountDetails: {
      Value: 10,
    },
    discount: 10,
    discountPercentage: 10,
    taxInclusive: true,
    hsnDetails: { code: "123456" },
  },
];

export const mockCalculateCartResult = {
  cartValue: {
    totalValue: 1000,
    totalTax: 100,
    grandTotal: 1100,
  },
  processedItems: mockTaxDetailsResult,
};

export const mockCurrency = {
  id: 1,
  currencyCode: "INR",
};

export const mockSellerCurrency = {
  id: 2,
  currencyCode: "USD",
};

export const mockUserCurrency = {
  id: 1,
  currencyCode: "INR",
};

export const mockRequestContext = {
  userId: 123,
  companyId: 456,
  tenantCode: "tenant1",
};

export const mockQuoteSettings = {
  taxExemption: false,
};
