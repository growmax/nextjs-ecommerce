import { BaseService } from "@/lib/api/services/BaseService";
import { RequestEditService } from "@/lib/api/services/RequestEditService/RequestEditService";
import {
  mockRequestEditParams,
  mockRequestEditParamsWithoutData,
  mockRequestEditResponse,
} from "@/lib/api/services/RequestEditService/RequestEditService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("RequestEditService", () => {
  let requestEditService: RequestEditService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    requestEditService = new RequestEditService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("requestEdit", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockRequestEditResponse);

      const result = await requestEditService.requestEdit(
        mockRequestEditParams
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        "orders/requestEdit?userId=123&companyId=456&orderIdentifier=ORD-001",
        { data: mockRequestEditParams.data },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
      expect(result).toEqual(mockRequestEditResponse);
    });

    it("should encode query parameters correctly", async () => {
      callApiSpy.mockResolvedValueOnce(mockRequestEditResponse);

      await requestEditService.requestEdit({
        userId: 123,
        companyId: 456,
        orderId: "ORD-001 & Special",
        data: {},
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("orderIdentifier=ORD-001%20%26%20Special"),
        expect.any(Object),
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should use empty object for data when not provided", async () => {
      callApiSpy.mockResolvedValueOnce(mockRequestEditResponse);

      await requestEditService.requestEdit(mockRequestEditParamsWithoutData);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        { data: {} },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should send data wrapped in data property", async () => {
      callApiSpy.mockResolvedValueOnce(mockRequestEditResponse);

      await requestEditService.requestEdit(mockRequestEditParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        { data: mockRequestEditParams.data },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should use PUT method", async () => {
      callApiSpy.mockResolvedValueOnce(mockRequestEditResponse);

      await requestEditService.requestEdit(mockRequestEditParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should return RequestEditResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockRequestEditResponse);

      const result = await requestEditService.requestEdit(
        mockRequestEditParams
      );

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result.success).toBe(true);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        requestEditService.requestEdit(mockRequestEditParams)
      ).rejects.toThrow("API Error");
    });
  });

  describe("requestEditServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockRequestEditResponse);

      const result = await requestEditService.requestEditServerSide(
        mockRequestEditParams
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "orders/requestEdit?userId=123&companyId=456&orderIdentifier=ORD-001",
        { data: mockRequestEditParams.data },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
      expect(result).toEqual(mockRequestEditResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await requestEditService.requestEditServerSide(
        mockRequestEditParams
      );

      expect(result).toBeNull();
    });

    it("should use empty object for data when not provided", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockRequestEditResponse);

      await requestEditService.requestEditServerSide(
        mockRequestEditParamsWithoutData
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        expect.any(String),
        { data: {} },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });
  });
});
