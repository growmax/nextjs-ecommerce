import { BaseService } from "@/lib/api/services/BaseService";
import {
  OrdersService,
  OrdersParams,
} from "@/lib/api/services/OrdersService/OrdersService";
import {
  mockCreateOrderData,
  mockCreateOrderResponse,
  mockOrdersParams,
  mockOrdersParamsAll,
  mockOrdersParamsWithFilters,
  mockOrdersResponse,
} from "@/lib/api/services/OrdersService/OrdersService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
  RequestContext: {},
}));

describe("OrdersService", () => {
  let ordersService: OrdersService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;
  let callWithSpy: jest.SpyInstance;
  let callWithSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    ordersService = new OrdersService();
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
    jest.clearAllMocks();
  });

  describe("buildQueryString", () => {
    it("should build query string with basic parameters", () => {
      const queryString = (ordersService as any).buildQueryString(
        mockOrdersParams
      );

      expect(queryString).toContain("userId=123");
      expect(queryString).toContain("companyId=456");
      expect(queryString).toContain("offset=0");
      expect(queryString).toContain("pgLimit=20");
      expect(queryString).toContain("status=pending");
    });

    it("should encode special characters in query string", () => {
      const params: OrdersParams = {
        userId: "123",
        companyId: "456",
        offset: 0,
        limit: 20,
        status: "pending & active",
      };

      const queryString = (ordersService as any).buildQueryString(params);

      expect(queryString).toContain("status=pending%20%26%20active");
    });

    it("should exclude filter parameters when filterType is 'all'", () => {
      const queryString = (ordersService as any).buildQueryString(
        mockOrdersParamsAll
      );

      expect(queryString).toContain("userId=123");
      expect(queryString).toContain("companyId=456");
      expect(queryString).toContain("offset=0");
      expect(queryString).toContain("pgLimit=20");
      expect(queryString).not.toContain("status");
    });

    it("should include all filter parameters when filterType is not 'all'", () => {
      const queryString = (ordersService as any).buildQueryString(
        mockOrdersParamsWithFilters
      );

      expect(queryString).toContain("orderId=ORD-001");
      expect(queryString).toContain("orderName=Test%20Order");
      expect(queryString).toContain("orderDateStart=2024-01-01");
    });

    it("should exclude undefined, null, and empty string values", () => {
      const params: OrdersParams = {
        userId: "123",
        companyId: "456",
        offset: 0,
        limit: 20,
        status: undefined,
        orderId: "",
        orderName: null as any,
      };

      const queryString = (ordersService as any).buildQueryString(params);

      expect(queryString).not.toContain("status");
      expect(queryString).not.toContain("orderId");
      expect(queryString).not.toContain("orderName");
    });
  });

  describe("getOrders", () => {
    it("should call API with correct endpoint and body", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersService.getOrders(mockOrdersParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/findByFilter"),
        expect.objectContaining({
          filter_index: 0,
          filter_name: "Default",
          limit: 20,
          offset: 0,
          pageNumber: 1,
          status: ["pending"],
        }),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrdersResponse);
    });

    it("should calculate pageNumber correctly", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrdersResponse);

      const params: OrdersParams = {
        userId: "123",
        companyId: "456",
        offset: 40,
        limit: 20,
      };

      await ordersService.getOrders(params);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          pageNumber: 3,
        }),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });
  });

  describe("getOrdersWithContext", () => {
    it("should call API with context", async () => {
      const mockContext = {};
      callWithSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersService.getOrdersWithContext(
        mockOrdersParams,
        mockContext as any
      );

      expect(callWithSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/findByFilter"),
        expect.any(Object),
        {
          context: mockContext,
          method: "POST",
        }
      );
      expect(result).toEqual(mockOrdersResponse);
    });
  });

  describe("getOrdersServerSide", () => {
    it("should call safe API", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersService.getOrdersServerSide(mockOrdersParams);

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/findByFilter"),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrdersResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await ordersService.getOrdersServerSide(mockOrdersParams);

      expect(result).toBeNull();
    });
  });

  describe("getOrdersServerSideWithContext", () => {
    it("should call safe API with context", async () => {
      const mockContext = {};
      callWithSafeSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersService.getOrdersServerSideWithContext(
        mockOrdersParams,
        mockContext as any
      );

      expect(callWithSafeSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/findByFilter"),
        expect.any(Object),
        {
          context: mockContext,
          method: "POST",
        }
      );
      expect(result).toEqual(mockOrdersResponse);
    });
  });

  describe("getAllOrders", () => {
    it("should call getOrders with filterType 'all'", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersService.getAllOrders({
        userId: "123",
        companyId: "456",
        offset: 0,
        limit: 20,
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/findByFilter"),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrdersResponse);
    });
  });

  describe("getAllOrdersServerSide", () => {
    it("should call getOrdersServerSide with filterType 'all'", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersService.getAllOrdersServerSide({
        userId: "123",
        companyId: "456",
        offset: 0,
        limit: 20,
      });

      expect(callApiSafeSpy).toHaveBeenCalled();
      expect(result).toEqual(mockOrdersResponse);
    });
  });

  describe("createOrder", () => {
    it("should call API with correct endpoint and data", async () => {
      callApiSpy.mockResolvedValueOnce(mockCreateOrderResponse);

      const result = await ordersService.createOrder(mockCreateOrderData);

      expect(callApiSpy).toHaveBeenCalledWith(
        `orders/create?userId=${mockCreateOrderData.userId}&companyId=${mockCreateOrderData.companyId}`,
        mockCreateOrderData,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockCreateOrderResponse);
    });
  });

  describe("createOrderWithContext", () => {
    it("should call API with context", async () => {
      const mockContext = {};
      callWithSpy.mockResolvedValueOnce(mockCreateOrderResponse);

      const result = await ordersService.createOrderWithContext(
        mockCreateOrderData,
        mockContext as any
      );

      expect(callWithSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/create"),
        mockCreateOrderData,
        {
          context: mockContext,
          method: "POST",
        }
      );
      expect(result).toEqual(mockCreateOrderResponse);
    });
  });

  describe("createOrderServerSide", () => {
    it("should call safe API", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockCreateOrderResponse);

      const result =
        await ordersService.createOrderServerSide(mockCreateOrderData);

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/create"),
        mockCreateOrderData,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockCreateOrderResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result =
        await ordersService.createOrderServerSide(mockCreateOrderData);

      expect(result).toBeNull();
    });
  });
});
