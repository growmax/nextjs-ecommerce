// Mocks for QuotationVersionService
// These mocks are for testing the service in isolation.

import type {
  CreateQuotationVersionRequest,
  CreateQuotationVersionResponse,
} from "./QuotationVersionService";

export const mockCreateQuotationVersionRequest: CreateQuotationVersionRequest =
  {
    quotationIdentifier: "QUO-001",
    userId: 123,
    companyId: 456,
    versionData: {
      products: [],
      total: 1000,
    },
  };

export const mockCreateQuotationVersionResponse: CreateQuotationVersionResponse =
  {
    success: true,
    result: {
      versionId: "V-001",
      quotationIdentifier: "QUO-001",
    },
    isLoggedIn: true,
    data: {
      versionNumber: 2,
    },
    message: "Version created successfully",
  };
