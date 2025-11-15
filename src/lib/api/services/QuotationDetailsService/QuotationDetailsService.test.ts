import { BaseService } from "../BaseService";
import { QuotationDetailsService } from "./QuotationDetailsService";
import {
  mockApiResponse,
  mockFetchQuotationDetailsRequest,
  mockQuotationDetailsResponse,
} from "./QuotationDetailsService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("QuotationDetailsService", () => {
  let quotationDetailsService: QuotationDetailsService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    quotationDetailsService = new QuotationDetailsService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("fetchQuotationDetails", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockApiResponse);

      const result = await quotationDetailsService.fetchQuotationDetails(
        mockFetchQuotationDetailsRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/quotes/fetchQuotationDetails?quotationIdentifier=QUO-001&userId=123&companyId=456`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockQuotationDetailsResponse);
    });

    it("should wrap response data in QuotationDetailsResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockApiResponse);

      const result = await quotationDetailsService.fetchQuotationDetails(
        mockFetchQuotationDetailsRequest
      );

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("quotationIdentifier");
    });

    it("should extract data from API response", async () => {
      callApiSpy.mockResolvedValueOnce(mockApiResponse);

      const result = await quotationDetailsService.fetchQuotationDetails(
        mockFetchQuotationDetailsRequest
      );

      expect(result.data.quotationIdentifier).toBe("QUO-001");
      expect(result.data.quoteName).toBe("Test Quotation");
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        quotationDetailsService.fetchQuotationDetails(
          mockFetchQuotationDetailsRequest
        )
      ).rejects.toThrow("API Error");
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockApiResponse);

      await quotationDetailsService.fetchQuotationDetails(
        mockFetchQuotationDetailsRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("fetchQuotationDetailsServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockApiResponse);

      const result =
        await quotationDetailsService.fetchQuotationDetailsServerSide(
          mockFetchQuotationDetailsRequest
        );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        `/quotes/fetchQuotationDetails?quotationIdentifier=QUO-001&userId=123&companyId=456`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockQuotationDetailsResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result =
        await quotationDetailsService.fetchQuotationDetailsServerSide(
          mockFetchQuotationDetailsRequest
        );

      expect(result).toBeNull();
    });

    it("should wrap response data in QuotationDetailsResponse", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockApiResponse);

      const result =
        await quotationDetailsService.fetchQuotationDetailsServerSide(
          mockFetchQuotationDetailsRequest
        );

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
      expect(result?.data).toHaveProperty("quotationIdentifier");
    });
  });
});
