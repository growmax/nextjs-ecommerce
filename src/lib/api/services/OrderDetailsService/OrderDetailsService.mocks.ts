// Mocks for OrderDetailsService
// These mocks are for testing the service in isolation.

import type {
  FetchOrderDetailsParams,
  OrderDetailsResponse,
} from "./OrderDetailsService";

export const mockFetchOrderDetailsParams: FetchOrderDetailsParams = {
  userId: 123,
  tenantId: "tenant-1",
  companyId: 456,
  orderId: "ORD-001",
};

export const mockOrderDetailsResponse: OrderDetailsResponse = {
  data: {
    orderIdentifier: "ORD-001",
    orderType: {
      channelCode: "WEB",
      id: 1,
      name: "Web",
      tenantId: 1,
    },
    createdDate: "2024-01-01",
    orderDeliveryDate: "2024-01-15",
    updatedBuyerStatus: "CONFIRMED",
    updatedSellerStatus: "PROCESSING",
    orderDetails: [
      {
        orderIdentifier: "ORD-001",
        orderName: "Test Order",
        grandTotal: 1000,
        subTotal: 900,
        taxableAmount: 850,
        buyerCompanyName: "Buyer Co",
        sellerCompanyName: "Seller Co",
        dbProductDetails: [
          {
            itemNo: 1,
            productShortDescription: "Product 1",
            unitPrice: 100,
            unitQuantity: 10,
            totalPrice: 1000,
          },
        ],
      },
    ],
    buyerCurrencySymbol: {
      currencyCode: "USD",
      symbol: "$",
      decimal: ".",
      thousand: ",",
      precision: 2,
    },
  },
  message: "Success",
  status: "success",
};

export const mockFetchOrderDetailsByVersionParams = {
  userId: 123,
  companyId: 456,
  orderIdentifier: "ORD-001",
  orderVersion: 2,
};
