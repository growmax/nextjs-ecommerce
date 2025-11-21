/**
 * Mock data for SearchDialogBox testing
 */

export const mockProductAssets = [
  {
    isDefault: 1,
    width: "500",
    height: "500",
    source: "https://example.com/images/product1.jpg",
    type: "image/jpeg",
  },
  {
    isDefault: 0,
    width: "500",
    height: "500",
    source: "https://example.com/images/product1-alt.jpg",
    type: "image/jpeg",
  },
];

export const mockProductResult = {
  productId: 12345,
  productShortDescription: "O RING 32 X 4 X",
  brandProductId: "SKU-001",
  brandsName: "Generic",
  productIndexName: "product-12345",
  productAssetss: mockProductAssets,
  b2CUnitListPrice: 150.5,
};

export const mockSearchResults = [
  mockProductResult,
  {
    productId: 12346,
    productShortDescription: "Hex Head Screw DIN 933",
    brandProductId: "SKU-002",
    brandsName: "Schwing",
    productIndexName: "product-12346",
    productAssetss: [
      {
        isDefault: 1,
        width: "500",
        height: "500",
        source: "https://example.com/images/product2.jpg",
        type: "image/jpeg",
      },
    ],
    b2CUnitListPrice: 25.0,
  },
  {
    productId: 12347,
    productShortDescription: "Piston Bushing",
    brandProductId: "SKU-003",
    brandsName: "Industrial",
    productIndexName: "product-12347",
    productAssetss: [],
    b2CUnitListPrice: 75.25,
  },
];

export const mockSearchResponse = {
  success: true,
  data: mockSearchResults,
  total: 3,
};

export const mockEmptySearchResponse = {
  success: true,
  data: [],
  total: 0,
};

export const mockErrorResponse = {
  success: false,
  data: [],
  total: 0,
};

export const mockSuggestionItems = [
  {
    key: "recent-1",
    label: "Recent: O RING",
    icon: "🕐",
    href: "/search?q=O+RING",
  },
  {
    key: "category-1",
    label: "Category: Fasteners",
    icon: "📁",
    href: "/category/fasteners",
  },
];
