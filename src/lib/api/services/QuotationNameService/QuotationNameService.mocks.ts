// Mocks for QuotationNameService
// These mocks are for testing the service in isolation.

import type {
  UpdateQuotationNameRequest,
  UpdateQuotationNameResponse,
} from "./QuotationNameService";

export const mockUpdateQuotationNameRequest: UpdateQuotationNameRequest = {
  userId: 123,
  companyId: 456,
  quotationIdentifier: "QUO-001",
  quotationName: "New Quotation Name",
};

export const mockUpdateQuotationNameResponse: UpdateQuotationNameResponse = {
  success: true,
  message: "Quotation name updated successfully",
  quotationName: "New Quotation Name",
};

export const mockUpdateQuotationNameResponseError: UpdateQuotationNameResponse =
  {
    success: false,
    message: "Failed to update quotation name",
  };
