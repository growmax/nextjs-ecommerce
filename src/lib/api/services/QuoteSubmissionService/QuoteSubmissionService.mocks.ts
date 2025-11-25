// Mocks for QuoteSubmissionService
// These mocks are for testing the service in isolation.

import type {
  QuoteSubmissionPayload,
  QuoteSubmissionRequest,
  QuoteSubmissionResponse,
} from "@/lib/api/services/QuoteSubmissionService/QuoteSubmissionService";

export const mockQuoteSubmissionPayload: QuoteSubmissionPayload = {
  quoteName: "Test Quote",
  versionCreatedTimestamp: "2024-01-01T00:00:00Z",
  dbProductDetails: [
    {
      productId: 1,
      quantity: 10,
      unitPrice: 100,
    },
  ],
  subTotal: 1000,
  overallTax: 100,
  overallShipping: 50,
  taxableAmount: 900,
  calculatedTotal: 1150,
  grandTotal: 1150,
  quoteUsers: [123],
  domainURL: "https://example.com",
  modifiedByUsername: "user@example.com",
};

export const mockQuoteSubmissionRequest: QuoteSubmissionRequest = {
  body: mockQuoteSubmissionPayload,
  quoteId: "QUO-001",
  userId: 123,
  companyId: 456,
};

export const mockQuoteSubmissionResponse: QuoteSubmissionResponse = {
  success: true,
  data: {
    quotationIdentifier: "QUO-001",
    versionNumber: 2,
  },
};
