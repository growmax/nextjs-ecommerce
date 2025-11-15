// Mocks for useQuoteSubmission hook

export const mockQuoteSubmissionRequest = {
  body: {
    quoteName: "Test Quote",
    versionCreatedTimestamp: "2024-01-01T00:00:00Z",
  } as any,
  quoteId: "test-quote-id",
  userId: "test-user-id",
  companyId: "test-company-id",
};

export const mockSuccessResponse = { success: true, data: {} };
export const mockFailureResponse = { success: false, data: {} };

export const mockQuoteSubmissionService = {
  submitQuoteAsNewVersion: jest.fn(),
};

export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};
