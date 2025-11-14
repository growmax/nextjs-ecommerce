import { BaseService } from "../BaseService";
import { OrderStatusService } from "./OrderStatusService";
import {
  mockOrderStatusParams,
  mockOrderStatusResponse,
  mockOrderStatusResponseEmpty,
} from "./OrderStatusService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
  RequestContext: {},
}));

describe("OrderStatusService", () => {
  let orderStatusService: OrderStatusService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;
  let callWithSpy: jest.SpyInstance;
  let callWithSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    orderStatusService = new OrderStatusService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
    callWithSpy = jest.spyOn(BaseService.prototype as any, "callWith");
    callWithSafeSpy = jest.spyOn(BaseService.prototype as any, "callWithSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    callWithSpy.mockRestore();
    callWithSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("findStatusByCompany", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      const result = await orderStatusService.findStatusByCompany(
        mockOrderStatusParams
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/orders/findStatusByCompany?userId=123&companyId=456`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrderStatusResponse);
    });

    it("should encode query parameters correctly", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      await orderStatusService.findStatusByCompany({
        userId: "123 & Special",
        companyId: "456",
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("userId=123%20%26%20Special"),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should return OrderStatusResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      const result = await orderStatusService.findStatusByCompany(
        mockOrderStatusParams
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        orderStatusService.findStatusByCompany(mockOrderStatusParams)
      ).rejects.toThrow("API Error");
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      await orderStatusService.findStatusByCompany(mockOrderStatusParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("findStatusByCompanyWithContext", () => {
    it("should call API with custom context", async () => {
      const mockContext = {};
      callWithSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      const result = await orderStatusService.findStatusByCompanyWithContext(
        mockOrderStatusParams,
        mockContext as any
      );

      expect(callWithSpy).toHaveBeenCalledWith(
        `/orders/findStatusByCompany?userId=123&companyId=456`,
        {},
        {
          context: mockContext,
          method: "GET",
        }
      );
      expect(result).toEqual(mockOrderStatusResponse);
    });
  });

  describe("findStatusByCompanyServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      const result = await orderStatusService.findStatusByCompanyServerSide(
        mockOrderStatusParams
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        `/orders/findStatusByCompany?userId=123&companyId=456`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrderStatusResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await orderStatusService.findStatusByCompanyServerSide(
        mockOrderStatusParams
      );

      expect(result).toBeNull();
    });
  });

  describe("findStatusByCompanyServerSideWithContext", () => {
    it("should call safe API with custom context", async () => {
      const mockContext = {};
      callWithSafeSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      const result =
        await orderStatusService.findStatusByCompanyServerSideWithContext(
          mockOrderStatusParams,
          mockContext as any
        );

      expect(callWithSafeSpy).toHaveBeenCalledWith(
        `/orders/findStatusByCompany?userId=123&companyId=456`,
        {},
        {
          context: mockContext,
          method: "GET",
        }
      );
      expect(result).toEqual(mockOrderStatusResponse);
    });
  });

  describe("getOrderStatuses", () => {
    it("should transform response to StatusOption array", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      const result = await orderStatusService.getOrderStatuses(
        mockOrderStatusParams
      );

      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({ value: "Draft", label: "Draft" });
      expect(result[1]).toEqual({ value: "Pending", label: "Pending" });
    });

    it("should use default userId and companyId when not provided", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      await orderStatusService.getOrderStatuses();

      expect(callApiSpy).toHaveBeenCalledWith(
        `/orders/findStatusByCompany?userId=1032&companyId=8690`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should handle empty status array", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderStatusResponseEmpty);

      const result = await orderStatusService.getOrderStatuses(
        mockOrderStatusParams
      );

      expect(result).toEqual([]);
    });
  });

  describe("getOrderStatusesServerSide", () => {
    it("should transform response to StatusOption array", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      const result = await orderStatusService.getOrderStatusesServerSide(
        mockOrderStatusParams
      );

      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({ value: "Draft", label: "Draft" });
    });

    it("should return empty array when response is null", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await orderStatusService.getOrderStatusesServerSide(
        mockOrderStatusParams
      );

      expect(result).toEqual([]);
    });

    it("should use default userId and companyId when not provided", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockOrderStatusResponse);

      await orderStatusService.getOrderStatusesServerSide();

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        `/orders/findStatusByCompany?userId=1032&companyId=8690`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });
});
