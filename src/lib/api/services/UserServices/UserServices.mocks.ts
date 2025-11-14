// Mocks for UserServices
// These mocks are for testing the service in isolation.

import type { UserApiResponse } from "@/lib/interfaces/UserInterfaces";

export const mockGetUserParams = {
  sub: "user123",
};

export const mockUserApiResponse: UserApiResponse = {
  data: {
    userId: 123,
    userCode: "user123",
    email: "john@example.com",
    displayName: "John Doe",
    picture: "https://example.com/pic.jpg",
    companyId: 456,
    companyName: "Test Company",
    companyLogo: "https://example.com/logo.jpg",
    currency: {
      currencyCode: "USD",
      id: 1,
    },
    taxExemption: false,
    isSeller: false,
    timeZone: "UTC",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
    isUserActive: 1,
    verified: true,
    seller: false,
    lastLoginAt: "2024-01-01T00:00:00Z",
    listAccessElements: [],
  } as any,
  message: "Success",
  status: "success",
};
