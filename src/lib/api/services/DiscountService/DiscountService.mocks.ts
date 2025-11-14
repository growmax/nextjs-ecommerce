// Mocks for DiscountService
// These mocks are for testing the service in isolation.

import type {
  CheckVolumeDiscountEnabledResponse,
  DiscountApiResponse,
  DiscountRequest,
  DiscountRequestWithContext,
  GetAllSellerPricesRequest,
  GetAllSellerPricesResponse,
} from "./DiscountService";

export const mockDiscountRequestWithContext: DiscountRequestWithContext = {
  userId: 123,
  tenantId: "tenant-1",
  body: {
    Productid: [1, 2, 3],
    CurrencyId: 1,
    BaseCurrencyId: 1,
    companyId: 456,
    currencyCode: "USD",
  },
};

export const mockDiscountRequest: DiscountRequest = {
  Productid: [1, 2, 3],
  CurrencyId: 1,
  BaseCurrencyId: 1,
  sellerId: "seller-1",
};

export const mockDiscountApiResponse: DiscountApiResponse = {
  success: true,
  data: [
    {
      MasterPrice: 100,
      BasePrice: 90,
      isProductAvailableInPriceList: true,
      discounts: [
        {
          Value: 10,
          startDate: "2024-01-01",
          min_qty: 1,
          max_qty: 10,
          discountId: "discount-1",
          minAmount: 0,
          maxAmount: 1000,
        },
      ],
      ProductVariantId: 1,
      isApprovalRequired: false,
      PricelistCode: "PL-001",
      plnErpCode: "ERP-001",
      isOveridePricelist: false,
      sellerId: "seller-1",
      sellerName: "Seller 1",
    },
  ],
  message: "Success",
  status: "success",
};

export const mockGetAllSellerPricesRequest: GetAllSellerPricesRequest = {
  Productid: [1, 2, 3],
  CurrencyId: 1,
  BaseCurrencyId: 1,
  CompanyId: 456,
};

export const mockGetAllSellerPricesResponse: GetAllSellerPricesResponse = {
  data: [
    {
      productId: 1,
      sellerId: 1,
      sellerName: "Seller 1",
      price: 100,
      currency: "USD",
      availability: true,
      leadTime: 7,
      minimumOrderQuantity: 1,
    },
  ],
  status: "success",
  message: "Success",
};

export const mockCheckVolumeDiscountEnabledResponse: CheckVolumeDiscountEnabledResponse =
  {
    data: true,
    message: "Success",
    status: "success",
  };
