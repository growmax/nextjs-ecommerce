// Mocks for OpenSearchService
// These mocks are for testing the service in isolation.

import type { ProductDetail } from "@/types/product/product-detail";

export const mockIdentifier = "product-123";
export const mockElasticIndex = "products";
export const mockElasticType = "pgproduct";
export const mockQueryType = "get";

export const mockProductDetail: ProductDetail = {
  productId: 123,
  id: "product-123",
  brandProductId: "BP-001",
  productName: "Test Product",
  productShortDescription: "Test Description",
  unitPrice: 100,
  unitListPrice: 120,
} as unknown as ProductDetail;

export const mockOpenSearchResponse = {
  _source: mockProductDetail,
};
