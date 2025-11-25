import { BaseService } from "@/lib/api/services/BaseService";
import { QuoteStatusService } from "@/lib/api/services/StatusService/StatusService";
import {
  mockQuoteStatusApiResponse,
  mockQuoteStatusApiResponseEmpty,
  mockQuoteStatusApiResponseWithSpecialChars,
  mockQuoteStatusParams,
  mockQuoteStatusParamsOrders,
} from "@/lib/api/services/StatusService/StatusService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("QuoteStatusService", () => {
  let statusService: QuoteStatusService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    statusService = new QuoteStatusService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getQuoteStatusByCompanyRaw", () => {
    it("should call API with correct endpoint for quotes module", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteStatusApiResponse);

      const result = await statusService.getQuoteStatusByCompanyRaw(
        mockQuoteStatusParams
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        "/quotes/findStatusByCompany?userId=123&companyId=456",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockQuoteStatusApiResponse);
    });

    it("should call API with correct endpoint for orders module", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteStatusApiResponse);

      const result = await statusService.getQuoteStatusByCompanyRaw(
        mockQuoteStatusParamsOrders
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        "/orders/findStatusByCompany?userId=123&companyId=456",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockQuoteStatusApiResponse);
    });

    it("should use default module 'quotes' when not provided", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteStatusApiResponse);

      await statusService.getQuoteStatusByCompanyRaw({
        userId: 123,
        companyId: 456,
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        "/quotes/findStatusByCompany?userId=123&companyId=456",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should throw error when userId is missing", async () => {
      await expect(
        statusService.getQuoteStatusByCompanyRaw({
          companyId: 456,
        } as any)
      ).rejects.toThrow("userId and companyId are required parameters");
    });

    it("should throw error when companyId is missing", async () => {
      await expect(
        statusService.getQuoteStatusByCompanyRaw({
          userId: 123,
        } as any)
      ).rejects.toThrow("userId and companyId are required parameters");
    });

    it("should fallback to orders endpoint when quotes fails with 500 error", async () => {
      const error500 = { status: 500, message: "Internal Server Error" };
      callApiSpy
        .mockRejectedValueOnce(error500)
        .mockResolvedValueOnce(mockQuoteStatusApiResponse);

      const result = await statusService.getQuoteStatusByCompanyRaw(
        mockQuoteStatusParams
      );

      expect(callApiSpy).toHaveBeenCalledTimes(2);
      expect(callApiSpy).toHaveBeenNthCalledWith(
        1,
        "/quotes/findStatusByCompany?userId=123&companyId=456",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(callApiSpy).toHaveBeenNthCalledWith(
        2,
        "/orders/findStatusByCompany?userId=123&companyId=456",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockQuoteStatusApiResponse);
    });

    it("should not fallback for non-500 errors", async () => {
      const error404 = { status: 404, message: "Not Found" };
      callApiSpy.mockRejectedValueOnce(error404);

      await expect(
        statusService.getQuoteStatusByCompanyRaw(mockQuoteStatusParams)
      ).rejects.toEqual(error404);

      expect(callApiSpy).toHaveBeenCalledTimes(1);
    });

    it("should not fallback for orders module errors", async () => {
      const error500 = { status: 500, message: "Internal Server Error" };
      callApiSpy.mockRejectedValueOnce(error500);

      await expect(
        statusService.getQuoteStatusByCompanyRaw(mockQuoteStatusParamsOrders)
      ).rejects.toEqual(error500);

      expect(callApiSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("getQuoteStatusByCompany", () => {
    it("should transform raw response to UI format", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteStatusApiResponse);

      const result = await statusService.getQuoteStatusByCompany(
        mockQuoteStatusParams
      );

      expect(result.data).toHaveLength(5); // null filtered out
      expect(result.data[0]).toEqual({ value: "draft", label: "Draft" });
      expect(result.data[1]).toEqual({ value: "sent", label: "Sent" });
      expect(result.message).toBe("Success");
      expect(result.status).toBe("success");
    });

    it("should filter out null values", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteStatusApiResponse);

      const result = await statusService.getQuoteStatusByCompany(
        mockQuoteStatusParams
      );

      expect(result.data.every(item => item.value !== null)).toBe(true);
      expect(result.data.every(item => item.label !== null)).toBe(true);
    });

    it("should handle empty data array", async () => {
      callApiSpy.mockResolvedValueOnce(mockQuoteStatusApiResponseEmpty);

      const result = await statusService.getQuoteStatusByCompany(
        mockQuoteStatusParams
      );

      expect(result.data).toEqual([]);
    });

    it("should use orders module transformation for orders", async () => {
      callApiSpy.mockResolvedValueOnce(
        mockQuoteStatusApiResponseWithSpecialChars
      );

      const result = await statusService.getQuoteStatusByCompany(
        mockQuoteStatusParamsOrders
      );

      // Orders module should preserve allowed characters (alphanumeric, spaces, .-_,@)
      expect(result.data[0]!.value).toBe("Order 123"); // # removed (not allowed)
      expect(result.data[1]!.value).toBe("Status-With-Dashes");
      expect(result.data[2]!.value).toBe("Status_With_Underscores");
    });

    it("should use quotes module transformation for quotes", async () => {
      callApiSpy.mockResolvedValueOnce(
        mockQuoteStatusApiResponseWithSpecialChars
      );

      const result = await statusService.getQuoteStatusByCompany(
        mockQuoteStatusParams
      );

      // Quotes module should convert to lowercase with underscores
      expect(result.data[0]!.value).toBe("order_#123"); // lowercase, spaces to underscores
      expect(result.data[1]!.value).toBe("status-with-dashes");
      expect(result.data[2]!.value).toBe("status_with_underscores");
    });
  });

  describe("getQuoteStatusByCompanyRawServerSide", () => {
    it("should return null when userId is missing", async () => {
      const result = await statusService.getQuoteStatusByCompanyRawServerSide({
        companyId: 456,
      } as any);

      expect(result).toBeNull();
    });

    it("should return null when companyId is missing", async () => {
      const result = await statusService.getQuoteStatusByCompanyRawServerSide({
        userId: 123,
      } as any);

      expect(result).toBeNull();
    });

    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockQuoteStatusApiResponse);

      const result = await statusService.getQuoteStatusByCompanyRawServerSide(
        mockQuoteStatusParams
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "/quotes/findStatusByCompany?userId=123&companyId=456",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockQuoteStatusApiResponse);
    });

    it("should fallback to orders endpoint when quotes fails", async () => {
      callApiSafeSpy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockQuoteStatusApiResponse);

      const result = await statusService.getQuoteStatusByCompanyRawServerSide(
        mockQuoteStatusParams
      );

      expect(callApiSafeSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockQuoteStatusApiResponse);
    });

    it("should not fallback for orders module", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await statusService.getQuoteStatusByCompanyRawServerSide(
        mockQuoteStatusParamsOrders
      );

      expect(callApiSafeSpy).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("getQuoteStatusByCompanyServerSide", () => {
    it("should return null when raw response is null", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await statusService.getQuoteStatusByCompanyServerSide(
        mockQuoteStatusParams
      );

      expect(result).toBeNull();
    });

    it("should transform raw response to UI format", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockQuoteStatusApiResponse);

      const result = await statusService.getQuoteStatusByCompanyServerSide(
        mockQuoteStatusParams
      );

      expect(result).not.toBeNull();
      expect(result?.data).toHaveLength(5);
      expect(result?.data[0]).toEqual({ value: "draft", label: "Draft" });
    });
  });
});
