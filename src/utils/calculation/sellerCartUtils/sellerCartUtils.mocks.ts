// Mocks for sellerCartUtils utilities
// These mocks are for testing the utilities in isolation.

export const mockCartItem = {
  productId: "prod-1",
  sellerId: "seller-1",
  sellerName: "Test Seller",
  sellerLocation: "Test Location",
  quantity: 10,
  unitPrice: 100,
  totalPrice: 1000,
  shippingCharges: 50,
};

export const mockCartItemSeller2 = {
  productId: "prod-2",
  sellerId: "seller-2",
  sellerName: "Seller 2",
  sellerLocation: "Location 2",
  quantity: 5,
  unitPrice: 200,
  totalPrice: 1000,
  shippingCharges: 25,
};

export const mockCartItemWithVendor = {
  productId: "prod-3",
  sellerId: "seller-1",
  vendorId: "vendor-1",
  vendorName: "Vendor Name",
  vendorLocation: "Vendor Location",
  quantity: 3,
  unitPrice: 150,
  totalPrice: 450,
};

export const mockCartItemWithoutLocation = {
  productId: "prod-4",
  sellerId: "seller-3",
  quantity: 2,
  unitPrice: 50,
  totalPrice: 100,
};

export const mockCartItems = [
  mockCartItem,
  { ...mockCartItem, productId: "prod-1b" },
  mockCartItemSeller2,
];

export const mockSellerCart = {
  "seller-1": {
    seller: {
      id: "seller-1",
      sellerId: "seller-1",
      name: "Test Seller",
      location: "Test Location",
    },
    items: [mockCartItem],
    itemCount: 1,
    totalQuantity: 10,
  },
  "seller-2": {
    seller: {
      id: "seller-2",
      sellerId: "seller-2",
      name: "Seller 2",
      location: "Location 2",
    },
    items: [mockCartItemSeller2],
    itemCount: 1,
    totalQuantity: 5,
  },
};

export const mockSellerCartWithPricing = {
  "seller-1": {
    ...mockSellerCart["seller-1"],
    pricing: {
      totalItems: 1,
      totalValue: 1000,
      totalTax: 100,
      grandTotal: 1100,
      totalLP: 50,
      pfRate: 5,
      totalShipping: 50,
    },
  },
  "seller-2": {
    ...mockSellerCart["seller-2"],
    pricing: {
      totalItems: 1,
      totalValue: 1000,
      totalTax: 80,
      grandTotal: 1080,
      totalLP: 100,
      pfRate: 10,
      totalShipping: 25,
    },
  },
};

export const mockVolumeDiscountData = {
  "seller-1": [
    {
      itemNo: "item-1",
      volumeDiscount: 10,
      appliedDiscount: 10,
    },
  ],
};

export const mockSellerPricingData = {
  "seller-1": [
    {
      ProductVariantId: "prod-1",
      MasterPrice: 100,
      BasePrice: 90,
    },
  ],
  "vendor-1": [
    {
      ProductVariantId: "prod-3",
      MasterPrice: 150,
      BasePrice: 140,
    },
  ],
};

export const mockAllSellerPricesData = {
  "seller-1": [
    {
      ProductVariantId: "prod-1",
      MasterPrice: 100,
      BasePrice: 90,
    },
  ],
  "seller-2": [
    {
      ProductVariantId: "prod-2",
      MasterPrice: 200,
      BasePrice: 180,
    },
  ],
  "seller-3": [
    {
      ProductVariantId: "prod-4",
      MasterPrice: 50,
      BasePrice: 45,
    },
  ],
};

export const mockPricingDataValid = {
  MasterPrice: 100,
  BasePrice: 90,
  priceNotAvailable: false,
};

export const mockPricingDataInvalid = {
  MasterPrice: null,
  BasePrice: null,
  priceNotAvailable: true,
};

export const mockPricingDataWithMasterPrice = {
  MasterPrice: 100,
  BasePrice: null,
  priceNotAvailable: false,
};

export const mockPricingDataWithBasePrice = {
  MasterPrice: null,
  BasePrice: 90,
  priceNotAvailable: false,
};

export const mockSellerCartsWithPricingSource = {
  "seller-1": {
    items: [
      {
        productId: "prod-1",
        pricingSource: "seller-specific",
      },
      {
        productId: "prod-2",
        pricingSource: "getAllSellerPrices-exact",
      },
    ],
  },
  "seller-2": {
    items: [
      {
        productId: "prod-3",
        pricingSource: "getAllSellerPrices-cross-seller",
      },
      {
        productId: "prod-4",
        priceNotAvailable: true,
        productName: "Product 4",
      },
    ],
  },
};
