// Mocks for QuotationDetailsService
// These mocks are for testing the service in isolation.

import type {
  FetchQuotationDetailsRequest,
  QuotationData,
  QuotationDetailsResponse,
} from "@/lib/api/services/QuotationDetailsService/QuotationDetailsService";

export const mockFetchQuotationDetailsRequest: FetchQuotationDetailsRequest = {
  quotationIdentifier: "QUO-001",
  userId: 123,
  companyId: 456,
};

export const mockQuotationData: QuotationData = {
  quotationIdentifier: "QUO-001",
  quoteName: "Test Quotation",
  updatedSellerStatus: "SENT",
  updatedBuyerStatus: "PENDING",
  saved: true,
  createdDate: "2024-01-01",
  lastUpdatedDate: "2024-01-02",
  buyerCompanyName: "Buyer Co",
  sellerCompanyName: "Seller Co",
  grandTotal: 1000,
  subTotal: 900,
  taxableAmount: 850,
  itemCount: 5,
  quotationDetails: [
    {
      quotationIdentifier: "QUO-001",
      quoteName: "Test Quotation",
      dbProductDetails: [
        {
          itemNo: 1,
          productName: "Product 1",
          quantity: 10,
          unitPrice: 100,
          totalPrice: 1000,
        },
      ],
    },
  ],
  buyerCurrencySymbol: {
    currencyCode: "USD",
    decimal: ".",
    description: "US Dollar",
    id: 1,
    precision: 2,
    symbol: "$",
    tenantId: 1,
    thousand: ",",
  },
};

export const mockQuotationDetailsResponse: QuotationDetailsResponse = {
  success: true,
  data: mockQuotationData,
};

export const mockApiResponse = {
  data: mockQuotationData,
};
