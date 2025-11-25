import { BaseService } from "@/lib/api/services/BaseService";
import { QuotationNameService } from "@/lib/api/services/QuotationNameService/QuotationNameService";
import {
  mockUpdateQuotationNameRequest,
  mockUpdateQuotationNameResponse,
} from "@/lib/api/services/QuotationNameService/QuotationNameService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("QuotationNameService", () => {
  let quotationNameService: QuotationNameService;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    quotationNameService = new QuotationNameService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("updateQuotationName", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateQuotationNameResponse);

      const result = await quotationNameService.updateQuotationName(
        mockUpdateQuotationNameRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        "/quotes/changeQuotationName?userId=123&companyId=456&quotationIdentifier=QUO-001",
        { newName: "New Quotation Name" },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
      expect(result).toEqual(mockUpdateQuotationNameResponse);
    });

    it("should encode query parameters correctly", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateQuotationNameResponse);

      await quotationNameService.updateQuotationName({
        userId: 123,
        companyId: 456,
        quotationIdentifier: "QUO-001 & Special",
        quotationName: "New Name",
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("quotationIdentifier=QUO-001%20%26%20Special"),
        { newName: "New Name" },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should send newName in request body", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateQuotationNameResponse);

      await quotationNameService.updateQuotationName(
        mockUpdateQuotationNameRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        { newName: "New Quotation Name" },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should use PUT method", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateQuotationNameResponse);

      await quotationNameService.updateQuotationName(
        mockUpdateQuotationNameRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should return UpdateQuotationNameResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateQuotationNameResponse);

      const result = await quotationNameService.updateQuotationName(
        mockUpdateQuotationNameRequest
      );

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result.success).toBe(true);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        quotationNameService.updateQuotationName(mockUpdateQuotationNameRequest)
      ).rejects.toThrow("API Error");
    });
  });

  describe("updateQuotationNameServerSide", () => {
    it("should call updateQuotationName and return result", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateQuotationNameResponse);

      const result = await quotationNameService.updateQuotationNameServerSide(
        mockUpdateQuotationNameRequest
      );

      expect(result).toEqual(mockUpdateQuotationNameResponse);
    });

    it("should return null on error", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("API Error"));

      const result = await quotationNameService.updateQuotationNameServerSide(
        mockUpdateQuotationNameRequest
      );

      expect(result).toBeNull();
    });

    it("should catch and suppress errors", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("Network Error"));

      const result = await quotationNameService.updateQuotationNameServerSide(
        mockUpdateQuotationNameRequest
      );

      expect(result).toBeNull();
    });
  });
});
