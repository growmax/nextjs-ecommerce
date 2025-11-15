// Mocks for ProductAssetsService
// These mocks are for testing the service in isolation.

import type { ProductAssetsResponse } from "./ProductAssetsService";

export const mockProductIds = [1, 2, 3];

export const mockProductAssetsResponse: ProductAssetsResponse = {
  data: [
    {
      id: 1,
      source: "https://example.com/image1.jpg",
      isDefault: true,
      height: 800,
      width: 600,
      type: "image",
      tenantId: 1,
      productId: {
        id: 1,
        brandProductId: "BP-001",
      },
    },
    {
      id: 2,
      source: "https://example.com/image2.jpg",
      isDefault: false,
      height: 800,
      width: 600,
      type: "image",
      tenantId: 1,
      productId: {
        id: 2,
        brandProductId: "BP-002",
      },
    },
  ],
  message: "Success",
  status: "success",
};

export const mockProductAssetsResponseEmpty: ProductAssetsResponse = {
  data: [],
  message: "No assets found",
  status: "success",
};
