import { BaseService } from "../BaseService";
import { OrderVersionService } from "./OrderVersionService";
import {
  mockCreateOrderVersionRequest,
  mockCreateOrderVersionResponse,
} from "./OrderVersionService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("OrderVersionService", () => {
  let orderVersionService: OrderVersionService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    orderVersionService = new OrderVersionService();
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
      callApiSpy.mockResolvedValueOnce(mockCreateOrderVersionResponse);

      const result = await orderVersionService.createNewVersion(
        mockCreateOrderVersionRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        "orders/createNewVersion?orderIdentifier=ORD-001&userId=123&companyId=456",
        mockCreateOrderVersionRequest.versionData,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockCreateOrderVersionResponse);
    });

    it("should encode orderIdentifier in query string", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateOrderVersionResponse);

      await orderVersionService.createNewVersion({
        orderIdentifier: "ORD-001 & Special",
        userId: 123,
        companyId: 456,
        versionData: {},
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("orderIdentifier=ORD-001%20%26%20Special"),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should send versionData in request body", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateOrderVersionResponse);

      await orderVersionService.createNewVersion(mockCreateOrderVersionRequest);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        mockCreateOrderVersionRequest.versionData,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should handle string userId and companyId", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateOrderVersionResponse);

      await orderVersionService.createNewVersion({
        orderIdentifier: "ORD-001",
        userId: "123",
        companyId: "456",
        versionData: {},
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        "orders/createNewVersion?orderIdentifier=ORD-001&userId=123&companyId=456",
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should use POST method", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateOrderVersionResponse);

      await orderVersionService.createNewVersion(mockCreateOrderVersionRequest);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should return CreateOrderVersionResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateOrderVersionResponse);

      const result = await orderVersionService.createNewVersion(
        mockCreateOrderVersionRequest
      );

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        orderVersionService.createNewVersion(mockCreateOrderVersionRequest)
      ).rejects.toThrow("API Error");
    });
  });

  describe("createNewVersionServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockCreateOrderVersionResponse);

      const result = await orderVersionService.createNewVersionServerSide(
        mockCreateOrderVersionRequest
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "orders/createNewVersion?orderIdentifier=ORD-001&userId=123&companyId=456",
        mockCreateOrderVersionRequest.versionData,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockCreateOrderVersionResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await orderVersionService.createNewVersionServerSide(
        mockCreateOrderVersionRequest
      );

      expect(result).toBeNull();
    });
  });
});
