// Mocks for useLatestOrderProducts
// These mocks are for testing the hook in isolation.

export const mockUser = {
  userId: 123,
  companyId: 456,
  currency: {
    id: 1,
    currencyCode: "INR",
  },
};

export const mockTenantData = {
  tenant: {
    tenantCode: "test-tenant",
    elasticCode: "testelastic",
  },
};

export const mockProducts = [
  {
    productId: 1,
    productName: "Product 1",
    unitPrice: 100,
    quantity: 2,
  },
  {
    productId: 2,
    productName: "Product 2",
    unitPrice: 200,
    quantity: 1,
  },
];

export const mockUpdatedProducts = [
  {
    productId: 1,
    productName: "Product 1",
    unitPrice: 95, // Updated price
    quantity: 2,
    discount: 5,
    tax: 18,
  },
  {
    productId: 2,
    productName: "Product 2",
    unitPrice: 190, // Updated price
    quantity: 1,
    discount: 10,
    tax: 34.2,
  },
];

export const mockCurrency = {
  id: 1,
  currencyCode: "INR",
};

export const mockSellerCurrency = {
  id: 2,
  currencyCode: "USD",
};

export const mockGetLatestTaxData = jest
  .fn()
  .mockResolvedValue(mockUpdatedProducts);
