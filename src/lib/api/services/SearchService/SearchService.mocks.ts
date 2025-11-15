// Mocks for SearchService
// These mocks are for testing the service in isolation.

import type {
  ElasticSearchOptions,
  ElasticSearchResponse,
  FormattedProduct,
  SearchProductsResponse,
} from "./SearchService";

export const mockFormattedProduct: FormattedProduct = {
  productId: 1,
  id: "1",
  brandProductId: "BP-001",
  productName: "Test Product",
  productShortDescription: "Test Description",
  shortDescription: "Test Description",
  brandsName: "Test Brand",
  brandName: "Test Brand",
  unitPrice: 100,
  unitListPrice: 120,
};

export const mockElasticSearchResponse: ElasticSearchResponse = {
  hits: {
    hits: [
      {
        _id: "1",
        _source: mockFormattedProduct,
      },
    ],
    total: {
      value: 1,
      relation: "eq",
    },
  },
};

export const mockSearchProductsResponse: SearchProductsResponse = {
  success: true,
  data: [mockFormattedProduct],
  total: 1,
};

export const mockElasticSearchOptions: ElasticSearchOptions = {
  elasticIndex: "test-index",
  query: {
    query: {
      bool: {
        must: [
          {
            match: {
              productName: "test",
            },
          },
        ],
      },
    },
    size: 20,
    from: 0,
  },
};

export const mockContext = {
  accessToken: "mock-token",
  tenantCode: "tenant-1",
  companyId: 456,
  userId: 123,
};
