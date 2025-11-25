import { BaseService } from "@/lib/api/services/BaseService";
import { OrderNameService } from "@/lib/api/services/OrderNameService/OrderNameService";
import {
  mockUpdateOrderNameRequest,
  mockUpdateOrderNameResponse,
} from "@/lib/api/services/OrderNameService/OrderNameService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("OrderNameService", () => {
  let orderNameService: OrderNameService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    orderNameService = new OrderNameService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("updateOrderName", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateOrderNameResponse);

      const result = await orderNameService.updateOrderName(
        mockUpdateOrderNameRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        "/orders/changeOrderName?userId=123&companyId=456&orderIdentifier=ORD-001",
        { newName: "New Order Name" },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
      expect(result).toEqual(mockUpdateOrderNameResponse);
    });

    it("should encode query parameters correctly", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateOrderNameResponse);

      await orderNameService.updateOrderName({
        userId: 123,
        companyId: 456,
        orderIdentifier: "ORD-001 & Special",
        orderName: "New Name",
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.stringContaining("orderIdentifier=ORD-001%20%26%20Special"),
        { newName: "New Name" },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should send newName in request body", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateOrderNameResponse);

      await orderNameService.updateOrderName(mockUpdateOrderNameRequest);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        { newName: "New Order Name" },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should use PUT method", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateOrderNameResponse);

      await orderNameService.updateOrderName(mockUpdateOrderNameRequest);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });

    it("should return UpdateOrderNameResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdateOrderNameResponse);

      const result = await orderNameService.updateOrderName(
        mockUpdateOrderNameRequest
      );

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result.success).toBe(true);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        orderNameService.updateOrderName(mockUpdateOrderNameRequest)
      ).rejects.toThrow("API Error");
    });
  });

  describe("updateOrderNameServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockUpdateOrderNameResponse);

      const result = await orderNameService.updateOrderNameServerSide(
        mockUpdateOrderNameRequest
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "/orders/changeOrderName?userId=123&companyId=456&orderIdentifier=ORD-001",
        { newName: "New Order Name" },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
      expect(result).toEqual(mockUpdateOrderNameResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await orderNameService.updateOrderNameServerSide(
        mockUpdateOrderNameRequest
      );

      expect(result).toBeNull();
    });

    it("should use PUT method", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockUpdateOrderNameResponse);

      await orderNameService.updateOrderNameServerSide(
        mockUpdateOrderNameRequest
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });
  });
});
