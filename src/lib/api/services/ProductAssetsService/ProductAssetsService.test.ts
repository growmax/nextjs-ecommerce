import { BaseService } from "@/lib/api/services/BaseService";
import { ProductAssetsService } from "@/lib/api/services/ProductAssetsService/ProductAssetsService";
import {
  mockProductAssetsResponse,
  mockProductAssetsResponseEmpty,
  mockProductIds,
} from "@/lib/api/services/ProductAssetsService/ProductAssetsService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("ProductAssetsService", () => {
  let productAssetsService: ProductAssetsService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    productAssetsService = new ProductAssetsService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getProductAssetsByProductIds", () => {
    it("should call API with correct endpoint and productIds array", async () => {
      callApiSpy.mockResolvedValueOnce(mockProductAssetsResponse);

      const result =
        await productAssetsService.getProductAssetsByProductIds(mockProductIds);

      expect(callApiSpy).toHaveBeenCalledWith(
        "productassetses/GetProductAssetsByProductIds",
        mockProductIds,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockProductAssetsResponse);
    });

    it("should send productIds array directly (not wrapped)", async () => {
      callApiSpy.mockResolvedValueOnce(mockProductAssetsResponse);

      await productAssetsService.getProductAssetsByProductIds(mockProductIds);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        mockProductIds,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should return ProductAssetsResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockProductAssetsResponse);

      const result =
        await productAssetsService.getProductAssetsByProductIds(mockProductIds);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should handle empty productIds array", async () => {
      callApiSpy.mockResolvedValueOnce(mockProductAssetsResponseEmpty);

      const result = await productAssetsService.getProductAssetsByProductIds(
        []
      );

      expect(result.data).toEqual([]);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        productAssetsService.getProductAssetsByProductIds(mockProductIds)
      ).rejects.toThrow("API Error");
    });

    it("should use POST method", async () => {
      callApiSpy.mockResolvedValueOnce(mockProductAssetsResponse);

      await productAssetsService.getProductAssetsByProductIds(mockProductIds);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });
  });

  describe("getProductAssetsByProductIdsServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockProductAssetsResponse);

      const result =
        await productAssetsService.getProductAssetsByProductIdsServerSide(
          mockProductIds
        );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "productassetses/GetProductAssetsByProductIds",
        mockProductIds,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockProductAssetsResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result =
        await productAssetsService.getProductAssetsByProductIdsServerSide(
          mockProductIds
        );

      expect(result).toBeNull();
    });
  });
});
