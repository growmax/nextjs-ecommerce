import { BaseService } from "@/lib/api/services/BaseService";
import {
  OrdersFilterService,
  OrdersFilterParams,
} from "@/lib/api/services/OrdersFilterService/OrdersFilterService";
import {
  mockOrderFilter,
  mockOrdersFilterParams,
  mockOrdersResponse,
} from "@/lib/api/services/OrdersFilterService/OrdersFilterService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
  RequestContext: {},
}));

describe("OrdersFilterService", () => {
  let ordersFilterService: OrdersFilterService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;
  let callWithSpy: jest.SpyInstance;

  beforeEach(() => {
    ordersFilterService = new OrdersFilterService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
    callWithSpy = jest.spyOn(BaseService.prototype as any, "callWith");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    callWithSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe("createDefaultFilter", () => {
    it("should create default filter with correct structure", () => {
      const filter = (ordersFilterService as any).createDefaultFilter(0, 20);

      expect(filter).toMatchObject({
        filter_index: 0,
        filter_name: "Current Filter",
        limit: 20,
        offset: 0,
        pageNumber: 1,
        status: [],
      });
    });

    it("should create filter with status", () => {
      const filter = (ordersFilterService as any).createDefaultFilter(
        0,
        20,
        "pending"
      );

      expect(filter.status).toEqual(["pending"]);
    });

    it("should calculate pageNumber correctly", () => {
      const filter = (ordersFilterService as any).createDefaultFilter(40, 20);

      expect(filter.pageNumber).toBe(3);
    });
  });

  describe("buildPayload", () => {
    it("should use provided filter if available", () => {
      const params: OrdersFilterParams = {
        userId: 123,
        companyId: 456,
        filters: [mockOrderFilter],
      };

      const payload = (ordersFilterService as any).buildPayload(params);

      expect(payload).toEqual(mockOrderFilter);
    });

    it("should create default filter if none provided", () => {
      const params: OrdersFilterParams = {
        userId: 123,
        companyId: 456,
      };

      const payload = (ordersFilterService as any).buildPayload(params);

      expect(payload).toMatchObject({
        filter_index: 0,
        filter_name: "Current Filter",
        limit: 20,
        offset: 0,
      });
    });
  });

  describe("buildQueryParams", () => {
    it("should build query string with all parameters", () => {
      const params: OrdersFilterParams = {
        userId: 123,
        companyId: 456,
        offset: 10,
        pgLimit: 30,
        status: "pending",
      };

      const queryString = (ordersFilterService as any).buildQueryParams(params);

      expect(queryString).toContain("userId=123");
      expect(queryString).toContain("companyId=456");
      expect(queryString).toContain("offset=10");
      expect(queryString).toContain("pgLimit=30");
      expect(queryString).toContain("status=pending");
    });

    it("should encode status in query string", () => {
      const params: OrdersFilterParams = {
        userId: 123,
        companyId: 456,
        status: "pending & active",
      };

      const queryString = (ordersFilterService as any).buildQueryParams(params);

      expect(queryString).toContain("status=pending%20%26%20active");
    });

    it("should use default values for offset and pgLimit", () => {
      const params: OrdersFilterParams = {
        userId: 123,
        companyId: 456,
      };

      const queryString = (ordersFilterService as any).buildQueryParams(params);

      expect(queryString).toContain("offset=0");
      expect(queryString).toContain("pgLimit=20");
    });
  });

  describe("getOrdersWithFilter", () => {
    it("should call API with correct endpoint and payload", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.getOrdersWithFilter(
        mockOrdersFilterParams
      );

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

  describe("getOrdersWithFilterAndContext", () => {
    it("should call API with context", async () => {
      const mockContext = {};
      callWithSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.getOrdersWithFilterAndContext(
        mockOrdersFilterParams,
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

  describe("getOrdersWithFilterServerSide", () => {
    it("should call safe API", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.getOrdersWithFilterServerSide(
        mockOrdersFilterParams
      );

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

      const result = await ordersFilterService.getOrdersWithFilterServerSide(
        mockOrdersFilterParams
      );

      expect(result).toBeNull();
    });
  });

  describe("getOrdersWithCustomFilters", () => {
    it("should call getOrdersWithFilter with custom filter", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.getOrdersWithCustomFilters(
        123,
        456,
        mockOrderFilter
      );

      expect(callApiSpy).toHaveBeenCalled();
      expect(result).toEqual(mockOrdersResponse);
    });
  });

  describe("getOrdersByStatus", () => {
    it("should call getOrdersWithFilter with status filter", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.getOrdersByStatus(
        123,
        456,
        "pending",
        0,
        20
      );

      expect(callApiSpy).toHaveBeenCalled();
      expect(result).toEqual(mockOrdersResponse);
    });
  });

  describe("getAllOrders", () => {
    it("should call getOrdersWithFilter without status", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.getAllOrders(123, 456, 0, 20);

      expect(callApiSpy).toHaveBeenCalled();
      expect(result).toEqual(mockOrdersResponse);
    });
  });

  describe("saveOrderFilter", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.saveOrderFilter(
        mockOrdersFilterParams
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/saveFilter"),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrdersResponse);
    });
  });

  describe("saveOrderFilterWithContext", () => {
    it("should call API with context", async () => {
      const mockContext = {};
      callWithSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.saveOrderFilterWithContext(
        mockOrdersFilterParams,
        mockContext as any
      );

      expect(callWithSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/saveFilter"),
        expect.any(Object),
        {
          context: mockContext,
          method: "POST",
        }
      );
      expect(result).toEqual(mockOrdersResponse);
    });
  });

  describe("saveOrderFilterServerSide", () => {
    it("should call safe API", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.saveOrderFilterServerSide(
        mockOrdersFilterParams
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        expect.stringContaining("orders/saveFilter"),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrdersResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await ordersFilterService.saveOrderFilterServerSide(
        mockOrdersFilterParams
      );

      expect(result).toBeNull();
    });
  });

  describe("saveCustomOrderFilter", () => {
    it("should call saveOrderFilter with custom filter", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrdersResponse);

      const result = await ordersFilterService.saveCustomOrderFilter(
        123,
        456,
        mockOrderFilter
      );

      expect(callApiSpy).toHaveBeenCalled();
      expect(result).toEqual(mockOrdersResponse);
    });
  });
});
