import { BaseService } from "@/lib/api/services/BaseService";
import { CartService } from "@/lib/api/services/CartService/CartService";
import {
  mockCart,
  mockCartCount,
  mockCartParams,
  mockCartParamsWithPos,
  mockClearCartBySellerParams,
} from "@/lib/api/services/CartService/CartService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("CartService", () => {
  let cartService: CartService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    cartService = new CartService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getCartCount", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockCartCount);

      const result = await cartService.getCartCount(mockCartParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        "/carts/findCartsCountByUserId?userId=123&pos=0",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockCartCount);
    });

    it("should use default pos value of 0 when not provided", async () => {
      callApiSpy.mockResolvedValueOnce(mockCartCount);

      await cartService.getCartCount({ userId: "123" });

      expect(callApiSpy).toHaveBeenCalledWith(
        "/carts/findCartsCountByUserId?userId=123&pos=0",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should use provided pos value", async () => {
      callApiSpy.mockResolvedValueOnce(mockCartCount);

      await cartService.getCartCount(mockCartParamsWithPos);

      expect(callApiSpy).toHaveBeenCalledWith(
        "/carts/findCartsCountByUserId?userId=123&pos=1",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should return CartCount", async () => {
      callApiSpy.mockResolvedValueOnce(mockCartCount);

      const result = await cartService.getCartCount(mockCartParams);

      expect(result).toHaveProperty("count");
      expect(result).toHaveProperty("userId");
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(cartService.getCartCount(mockCartParams)).rejects.toThrow(
        "API Error"
      );
    });
  });

  describe("getCartCountServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockCartCount);

      const result = await cartService.getCartCountServerSide(mockCartParams);

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "/carts/findCartsCountByUserId?userId=123&pos=0",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockCartCount);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await cartService.getCartCountServerSide(mockCartParams);

      expect(result).toBeNull();
    });
  });

  describe("getCart", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockCart);

      const result = await cartService.getCart(mockCartParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        "/carts?userId=123&find=ByUserId&pos=0",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockCart);
    });

    it("should use default pos value of 0 when not provided", async () => {
      callApiSpy.mockResolvedValueOnce(mockCart);

      await cartService.getCart({ userId: "123" });

      expect(callApiSpy).toHaveBeenCalledWith(
        "/carts?userId=123&find=ByUserId&pos=0",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should return Cart", async () => {
      callApiSpy.mockResolvedValueOnce(mockCart);

      const result = await cartService.getCart(mockCartParams);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("userId");
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(cartService.getCart(mockCartParams)).rejects.toThrow(
        "API Error"
      );
    });
  });

  describe("getCartServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockCart);

      const result = await cartService.getCartServerSide(mockCartParams);

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "/carts?userId=123&find=ByUserId&pos=0",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockCart);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await cartService.getCartServerSide(mockCartParams);

      expect(result).toBeNull();
    });
  });

  describe("deleteCart", () => {
    it("should call API with correct endpoint and DELETE method", async () => {
      callApiSpy.mockResolvedValueOnce({ success: true });

      await cartService.deleteCart(mockCartParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        "/carts?userId=123&find=ByUserId&pos=0",
        {},
        expect.any(Object),
        "DELETE",
        expect.any(Object)
      );
    });

    it("should use default pos value of 0 when not provided", async () => {
      callApiSpy.mockResolvedValueOnce({ success: true });

      await cartService.deleteCart({ userId: "123" });

      expect(callApiSpy).toHaveBeenCalledWith(
        "/carts?userId=123&find=ByUserId&pos=0",
        {},
        expect.any(Object),
        "DELETE",
        expect.any(Object)
      );
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(cartService.deleteCart(mockCartParams)).rejects.toThrow(
        "API Error"
      );
    });
  });

  describe("deleteCartServerSide", () => {
    it("should call safe API with DELETE method", async () => {
      callApiSafeSpy.mockResolvedValueOnce({ success: true });

      const result = await cartService.deleteCartServerSide(mockCartParams);

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "/carts?userId=123&find=ByUserId&pos=0",
        {},
        expect.any(Object),
        "DELETE",
        expect.any(Object)
      );
      expect(result).toEqual({ success: true });
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await cartService.deleteCartServerSide(mockCartParams);

      expect(result).toBeNull();
    });
  });

  describe("clearCartBySeller", () => {
    it("should call API with correct endpoint and DELETE method", async () => {
      callApiSpy.mockResolvedValueOnce({ success: true });

      await cartService.clearCartBySeller(mockClearCartBySellerParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        "/carts/clearCartBySeller?userId=123&sellerId=456",
        {},
        expect.any(Object),
        "DELETE",
        expect.any(Object)
      );
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        cartService.clearCartBySeller(mockClearCartBySellerParams)
      ).rejects.toThrow("API Error");
    });
  });

  describe("clearCartBySellerServerSide", () => {
    it("should call safe API with DELETE method", async () => {
      callApiSafeSpy.mockResolvedValueOnce({ success: true });

      const result = await cartService.clearCartBySellerServerSide(
        mockClearCartBySellerParams
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "/carts/clearCartBySeller?userId=123&sellerId=456",
        {},
        expect.any(Object),
        "DELETE",
        expect.any(Object)
      );
      expect(result).toEqual({ success: true });
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await cartService.clearCartBySellerServerSide(
        mockClearCartBySellerParams
      );

      expect(result).toBeNull();
    });
  });
});
