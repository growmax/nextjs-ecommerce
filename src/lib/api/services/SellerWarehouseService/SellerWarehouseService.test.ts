import { BaseService } from "../BaseService";
import { SellerWarehouseService } from "./SellerWarehouseService";
import {
  mockCompanyId,
  mockFindSellerBranchRequest,
  mockSellerBranchResponse,
  mockSellerBranches,
  mockUserId,
  mockWarehouse,
  mockWarehouseResponse,
} from "./SellerWarehouseService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("SellerWarehouseService", () => {
  let sellerWarehouseService: SellerWarehouseService;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    sellerWarehouseService = new SellerWarehouseService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("findSellerBranch", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockSellerBranchResponse);

      const result = await sellerWarehouseService.findSellerBranch(
        mockUserId,
        mockCompanyId,
        mockFindSellerBranchRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/branches/findsellerBranch/${mockUserId}?companyId=${mockFindSellerBranchRequest.sellerCompanyId}`,
        mockFindSellerBranchRequest,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockSellerBranches);
    });

    it("should normalize API response to SellerBranch array", async () => {
      callApiSpy.mockResolvedValueOnce(mockSellerBranchResponse);

      const result = await sellerWarehouseService.findSellerBranch(
        mockUserId,
        mockCompanyId,
        mockFindSellerBranchRequest
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("branchId");
      expect(result[0]).toHaveProperty("companyId");
    });

    it("should return empty array when response has no data", async () => {
      callApiSpy.mockResolvedValueOnce({ success: true, data: [] });

      const result = await sellerWarehouseService.findSellerBranch(
        mockUserId,
        mockCompanyId,
        mockFindSellerBranchRequest
      );

      expect(result).toEqual([]);
    });

    it("should return empty array when response structure is invalid", async () => {
      callApiSpy.mockResolvedValueOnce({ invalid: "structure" });

      const result = await sellerWarehouseService.findSellerBranch(
        mockUserId,
        mockCompanyId,
        mockFindSellerBranchRequest
      );

      expect(result).toEqual([]);
    });

    it("should use POST method", async () => {
      callApiSpy.mockResolvedValueOnce(mockSellerBranchResponse);

      await sellerWarehouseService.findSellerBranch(
        mockUserId,
        mockCompanyId,
        mockFindSellerBranchRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        sellerWarehouseService.findSellerBranch(
          mockUserId,
          mockCompanyId,
          mockFindSellerBranchRequest
        )
      ).rejects.toThrow("API Error");
    });
  });

  describe("findWarehouseByBranchId", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockWarehouseResponse);

      const result = await sellerWarehouseService.findWarehouseByBranchId(1);

      expect(callApiSpy).toHaveBeenCalledWith(
        `/branches/findWareHouseByBranchId/2?branchId=1`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockWarehouse);
    });

    it("should normalize API response to Warehouse object", async () => {
      callApiSpy.mockResolvedValueOnce(mockWarehouseResponse);

      const result = await sellerWarehouseService.findWarehouseByBranchId(1);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("wareHouseName");
      expect(result?.wareHousecode).toBe("WH-001");
    });

    it("should return null when response has no data", async () => {
      callApiSpy.mockResolvedValueOnce({ success: true, data: null });

      const result = await sellerWarehouseService.findWarehouseByBranchId(1);

      expect(result).toBeNull();
    });

    it("should return null when response structure is invalid", async () => {
      callApiSpy.mockResolvedValueOnce({ invalid: "structure" });

      const result = await sellerWarehouseService.findWarehouseByBranchId(1);

      expect(result).toBeNull();
    });

    it("should return null on API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      const result = await sellerWarehouseService.findWarehouseByBranchId(1);

      expect(result).toBeNull();
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockWarehouseResponse);

      await sellerWarehouseService.findWarehouseByBranchId(1);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("getSellerBranchAndWarehouse", () => {
    it("should return both seller branch and warehouse", async () => {
      callApiSpy
        .mockResolvedValueOnce(mockSellerBranchResponse)
        .mockResolvedValueOnce(mockWarehouseResponse);

      const result = await sellerWarehouseService.getSellerBranchAndWarehouse(
        mockUserId,
        mockCompanyId,
        mockFindSellerBranchRequest
      );

      expect(result.sellerBranch).toEqual(mockSellerBranches[0]);
      expect(result.warehouse).toEqual(mockWarehouse);
    });

    it("should return null warehouse when seller branch API fails", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("API Error"));

      const result = await sellerWarehouseService.getSellerBranchAndWarehouse(
        mockUserId,
        mockCompanyId,
        mockFindSellerBranchRequest
      );

      expect(result.sellerBranch).toBeNull();
      expect(result.warehouse).toBeNull();
    });

    it("should return seller branch even when warehouse API fails", async () => {
      callApiSpy
        .mockResolvedValueOnce(mockSellerBranchResponse)
        .mockRejectedValueOnce(new Error("Warehouse API Error"));

      const result = await sellerWarehouseService.getSellerBranchAndWarehouse(
        mockUserId,
        mockCompanyId,
        mockFindSellerBranchRequest
      );

      expect(result.sellerBranch).toEqual(mockSellerBranches[0]);
      expect(result.warehouse).toBeNull();
    });

    it("should use buyerBranchId when seller branch is not found", async () => {
      callApiSpy
        .mockResolvedValueOnce({ success: true, data: [] })
        .mockResolvedValueOnce(mockWarehouseResponse);

      const result = await sellerWarehouseService.getSellerBranchAndWarehouse(
        mockUserId,
        mockCompanyId,
        mockFindSellerBranchRequest
      );

      expect(result.sellerBranch).toBeNull();
      // Check the second call (warehouse API) was called with buyerBranchId
      expect(callApiSpy).toHaveBeenNthCalledWith(
        2,
        `/branches/findWareHouseByBranchId/2?branchId=${mockFindSellerBranchRequest.buyerBranchId}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });
});
