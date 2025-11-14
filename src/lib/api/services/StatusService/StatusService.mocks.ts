// Mocks for StatusService
// These mocks are for testing the service in isolation.

import type {
  QuoteStatusApiResponse,
  QuoteStatusParams,
  QuoteStatusResponse,
} from "./StatusService";

export const mockQuoteStatusParams: QuoteStatusParams = {
  userId: 123,
  companyId: 456,
  module: "quotes",
};

export const mockQuoteStatusParamsOrders: QuoteStatusParams = {
  userId: 123,
  companyId: 456,
  module: "orders",
};

export const mockQuoteStatusApiResponse: QuoteStatusApiResponse = {
  data: ["Draft", "Sent", "Accepted", "Rejected", "Cancelled"],
  message: "Success",
  status: "success",
};

export const mockQuoteStatusApiResponseEmpty: QuoteStatusApiResponse = {
  data: [],
  message: "No statuses found",
  status: "success",
};

export const mockQuoteStatusResponse: QuoteStatusResponse = {
  data: [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
  ],
  message: "Success",
  status: "success",
};

export const mockQuoteStatusApiResponseWithSpecialChars: QuoteStatusApiResponse =
  {
    data: ["Order #123", "Status-With-Dashes", "Status_With_Underscores"],
    message: "Success",
    status: "success",
  };
