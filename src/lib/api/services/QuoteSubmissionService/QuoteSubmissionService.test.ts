import { BaseService } from "../BaseService";
import { QuoteSubmissionService } from "./QuoteSubmissionService";
import {
  mockQuoteSubmissionRequest,
  mockQuoteSubmissionResponse,
} from "./QuoteSubmissionService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("QuoteSubmissionService", () => {
  let quoteSubmissionService: QuoteSubmissionService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    quoteSubmissionService = new QuoteSubmissionService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("submitQuoteAsNewVersion", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteSubmissionResponse);

      const result = await quoteSubmissionService.submitQuoteAsNewVersion(
        mockQuoteSubmissionRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/quotes/submitAsNewVersion?userId=123&quotationIdentifier=QUO-001&companyId=456`,
        mockQuoteSubmissionRequest.body,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockQuoteSubmissionResponse);
    });

    it("should encode quoteId in query string", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteSubmissionResponse);

      await quoteSubmissionService.submitQuoteAsNewVersion({
        ...mockQuoteSubmissionRequest,
        quoteId: "QUO-001 & Special",
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("quotationIdentifier=QUO-001%20%26%20Special"),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should send body in request", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteSubmissionResponse);

      await quoteSubmissionService.submitQuoteAsNewVersion(
        mockQuoteSubmissionRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        mockQuoteSubmissionRequest.body,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should handle string userId and companyId", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteSubmissionResponse);

      await quoteSubmissionService.submitQuoteAsNewVersion({
        ...mockQuoteSubmissionRequest,
        userId: "123",
        companyId: "456",
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        `/quotes/submitAsNewVersion?userId=123&quotationIdentifier=QUO-001&companyId=456`,
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should use POST method", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteSubmissionResponse);

      await quoteSubmissionService.submitQuoteAsNewVersion(
        mockQuoteSubmissionRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should return QuoteSubmissionResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteSubmissionResponse);

      const result = await quoteSubmissionService.submitQuoteAsNewVersion(
        mockQuoteSubmissionRequest
      );

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
      expect(result.success).toBe(true);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        quoteSubmissionService.submitQuoteAsNewVersion(
          mockQuoteSubmissionRequest
        )
      ).rejects.toThrow("API Error");
    });
  });

  describe("submitQuoteAsNewVersionServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockQuoteSubmissionResponse);

      const result =
        await quoteSubmissionService.submitQuoteAsNewVersionServerSide(
          mockQuoteSubmissionRequest
        );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        `/quotes/submitAsNewVersion?userId=123&quotationIdentifier=QUO-001&companyId=456`,
        mockQuoteSubmissionRequest.body,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockQuoteSubmissionResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result =
        await quoteSubmissionService.submitQuoteAsNewVersionServerSide(
          mockQuoteSubmissionRequest
        );

      expect(result).toBeNull();
    });
  });
});
