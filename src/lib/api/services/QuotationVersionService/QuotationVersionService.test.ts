import { BaseService } from "../BaseService";
import { QuotationVersionService } from "./QuotationVersionService";
import {
  mockCreateQuotationVersionRequest,
  mockCreateQuotationVersionResponse,
} from "./QuotationVersionService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("QuotationVersionService", () => {
  let quotationVersionService: QuotationVersionService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    quotationVersionService = new QuotationVersionService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("createNewVersion", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateQuotationVersionResponse);

      const result = await quotationVersionService.createNewVersion(
        mockCreateQuotationVersionRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        "quotes/createNewVersion?quotationIdentifier=QUO-001&userId=123&companyId=456",
        mockCreateQuotationVersionRequest.versionData,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockCreateQuotationVersionResponse);
    });

    it("should encode quotationIdentifier in query string", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateQuotationVersionResponse);

      await quotationVersionService.createNewVersion({
        quotationIdentifier: "QUO-001 & Special",
        userId: 123,
        companyId: 456,
        versionData: {},
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("quotationIdentifier=QUO-001%20%26%20Special"),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should send versionData in request body", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateQuotationVersionResponse);

      await quotationVersionService.createNewVersion(
        mockCreateQuotationVersionRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        mockCreateQuotationVersionRequest.versionData,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should handle string userId and companyId", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateQuotationVersionResponse);

      await quotationVersionService.createNewVersion({
        quotationIdentifier: "QUO-001",
        userId: "123",
        companyId: "456",
        versionData: {},
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        "quotes/createNewVersion?quotationIdentifier=QUO-001&userId=123&companyId=456",
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should use POST method", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateQuotationVersionResponse);

      await quotationVersionService.createNewVersion(
        mockCreateQuotationVersionRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should return CreateQuotationVersionResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateQuotationVersionResponse);

      const result = await quotationVersionService.createNewVersion(
        mockCreateQuotationVersionRequest
      );

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        quotationVersionService.createNewVersion(
          mockCreateQuotationVersionRequest
        )
      ).rejects.toThrow("API Error");
    });
  });

  describe("createNewVersionServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockCreateQuotationVersionResponse);

      const result = await quotationVersionService.createNewVersionServerSide(
        mockCreateQuotationVersionRequest
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "quotes/createNewVersion?quotationIdentifier=QUO-001&userId=123&companyId=456",
        mockCreateQuotationVersionRequest.versionData,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockCreateQuotationVersionResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await quotationVersionService.createNewVersionServerSide(
        mockCreateQuotationVersionRequest
      );

      expect(result).toBeNull();
    });
  });
});
