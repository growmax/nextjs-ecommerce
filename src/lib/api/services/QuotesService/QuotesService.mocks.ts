// Mocks for QuotesService
// These mocks are for testing the service in isolation.

import type {
  QuotesApiResponse,
  QuotesQueryParams,
  QuotesRequestBody,
} from "@/lib/api/services/QuotesService/QuotesService";

export const mockQuotesQueryParams: QuotesQueryParams = {
  userId: 123,
  companyId: 456,
  offset: 0,
  limit: 20,
};

export const mockQuotesRequestBody: Partial<QuotesRequestBody> = {
  filter_index: 0,
  filter_name: "Test Filter",
  status: ["PENDING"],
};

export const mockQuotesApiResponse: QuotesApiResponse = {
  data: {
    quotesResponse: [
      {
        quotationIdentifier: "QUO-001",
        quoteName: "Test Quote",
        buyerCompanyName: "Buyer Co",
        sellerCompanyName: "Seller Co",
        grandTotal: 1000,
        subTotal: 900,
        taxableAmount: 850,
        calculatedTotal: 1000,
        itemCount: 5,
        createdDate: "2024-01-01",
        lastUpdatedDate: "2024-01-02",
        updatedBuyerStatus: "PENDING",
        updatedSellerStatus: "SENT",
        SPRRequested: false,
        approvalAwaiting: null,
        approvalGroupId: null,
        approvalInitiated: false,
        buyerCompanyBranchName: "Branch 1",
        sellerCompanyBranchName: "Branch 2",
        curencySymbol: {
          currencyCode: "USD",
          decimal: ".",
          description: "US Dollar",
          id: 1,
          precision: 2,
          symbol: "$",
          tenantId: 1,
          thousand: ",",
        },
        customerRequiredDate: null,
        erpCode: null,
        leadIdentifier: null,
        orderIdentifier: null,
        quoteUsers: null,
        vendorId: null,
      },
    ],
    totalQuoteCount: 1,
  },
  message: "Success",
  status: "success",
};
