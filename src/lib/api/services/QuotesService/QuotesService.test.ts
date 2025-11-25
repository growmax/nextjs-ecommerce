import { BaseService } from "@/lib/api/services/BaseService";
import { QuotesService } from "@/lib/api/services/QuotesService/QuotesService";
import {
  mockQuotesApiResponse,
  mockQuotesQueryParams,
  mockQuotesRequestBody,
} from "@/lib/api/services/QuotesService/QuotesService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("QuotesService", () => {
  let quotesService: QuotesService;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    quotesService = new QuotesService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getQuotes", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuotesApiResponse);

      const result = await quotesService.getQuotes(
        mockQuotesQueryParams,
        mockQuotesRequestBody
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/quotes/findByFilter?userId=123&companyId=456&offset=0&limit=20`,
        expect.objectContaining({
          filter_index: 0,
          filter_name: "Test Filter",
          status: ["PENDING"],
          limit: 20,
          offset: 0,
        }),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockQuotesApiResponse);
    });

    it("should merge requestBody with default values", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuotesApiResponse);

      await quotesService.getQuotes(mockQuotesQueryParams, {
        filter_name: "Custom Filter",
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          filter_name: "Custom Filter",
          filter_index: 0,
          limit: 20,
          offset: 0,
          status: [],
        }),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should use default offset and limit when not provided", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuotesApiResponse);

      await quotesService.getQuotes(
        {
          userId: 123,
          companyId: 456,
        },
        {}
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/quotes/findByFilter?userId=123&companyId=456&offset=0&limit=20`,
        expect.objectContaining({
          limit: 20,
          offset: 0,
        }),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should return QuotesApiResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuotesApiResponse);

      const result = await quotesService.getQuotes(
        mockQuotesQueryParams,
        mockQuotesRequestBody
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
      expect(result.data).toHaveProperty("quotesResponse");
      expect(result.data).toHaveProperty("totalQuoteCount");
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        quotesService.getQuotes(mockQuotesQueryParams, mockQuotesRequestBody)
      ).rejects.toThrow("API Error");
    });

    it("should use POST method", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuotesApiResponse);

      await quotesService.getQuotes(
        mockQuotesQueryParams,
        mockQuotesRequestBody
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });
  });
});
