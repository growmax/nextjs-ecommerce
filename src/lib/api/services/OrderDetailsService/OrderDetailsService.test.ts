import { BaseService } from "../BaseService";
import { OrderDetailsService } from "./OrderDetailsService";
import {
  mockFetchOrderDetailsParams,
  mockFetchOrderDetailsByVersionParams,
  mockOrderDetailsResponse,
} from "./OrderDetailsService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
  RequestContext: {},
}));

describe("OrderDetailsService", () => {
  let orderDetailsService: OrderDetailsService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;
  let callWithSpy: jest.SpyInstance;
  let callWithSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    orderDetailsService = new OrderDetailsService();
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

  describe("fetchOrderDetails", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderDetailsResponse);

      const result = await orderDetailsService.fetchOrderDetails(
        mockFetchOrderDetailsParams
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        "orders/fetchOrderDetails?userId=123&companyId=456&orderIdentifier=ORD-001",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrderDetailsResponse);
    });

    it("should return OrderDetailsResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderDetailsResponse);

      const result = await orderDetailsService.fetchOrderDetails(
        mockFetchOrderDetailsParams
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
      expect(result.data).toHaveProperty("orderIdentifier");
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        orderDetailsService.fetchOrderDetails(mockFetchOrderDetailsParams)
      ).rejects.toThrow("API Error");
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderDetailsResponse);

      await orderDetailsService.fetchOrderDetails(mockFetchOrderDetailsParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("fetchOrderDetailsByVersion", () => {
    it("should call API with correct endpoint including version", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderDetailsResponse);

      const result = await orderDetailsService.fetchOrderDetailsByVersion(
        mockFetchOrderDetailsByVersionParams
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        "orders/fetchOrderDetailsByVersion?userId=123&companyId=456&orderIdentifier=ORD-001&orderVersion=2",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrderDetailsResponse);
    });

    it("should include orderVersion in query string", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderDetailsResponse);

      await orderDetailsService.fetchOrderDetailsByVersion(
        mockFetchOrderDetailsByVersionParams
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("orderVersion=2"),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("fetchOrderDetailsWithContext", () => {
    it("should call API with custom context", async () => {
      const mockContext = {};
      callWithSpy.mockResolvedValueOnce(mockOrderDetailsResponse);

      const result = await orderDetailsService.fetchOrderDetailsWithContext(
        mockFetchOrderDetailsParams,
        mockContext as any
      );

      expect(callWithSpy).toHaveBeenCalledWith(
        "orders/fetchOrderDetails?userId=123&companyId=456&orderIdentifier=ORD-001",
        {},
        {
          context: mockContext,
          method: "GET",
        }
      );
      expect(result).toEqual(mockOrderDetailsResponse);
    });
  });

  describe("fetchOrderDetailsServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockOrderDetailsResponse);

      const result = await orderDetailsService.fetchOrderDetailsServerSide(
        mockFetchOrderDetailsParams
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "orders/fetchOrderDetails?userId=123&companyId=456&orderIdentifier=ORD-001",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrderDetailsResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await orderDetailsService.fetchOrderDetailsServerSide(
        mockFetchOrderDetailsParams
      );

      expect(result).toBeNull();
    });
  });

  describe("fetchOrderDetailsServerSideWithContext", () => {
    it("should call safe API with custom context", async () => {
      const mockContext = {};
      callWithSafeSpy.mockResolvedValueOnce(mockOrderDetailsResponse);

      const result =
        await orderDetailsService.fetchOrderDetailsServerSideWithContext(
          mockFetchOrderDetailsParams,
          mockContext as any
        );

      expect(callWithSafeSpy).toHaveBeenCalledWith(
        "orders/fetchOrderDetails?userId=123&companyId=456&orderIdentifier=ORD-001",
        {},
        {
          context: mockContext,
          method: "GET",
        }
      );
      expect(result).toEqual(mockOrderDetailsResponse);
    });
  });
});
