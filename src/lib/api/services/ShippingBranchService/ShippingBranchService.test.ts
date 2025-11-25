import { BaseService } from "@/lib/api/services/BaseService";
import { ShippingBranchService } from "@/lib/api/services/ShippingBranchService/ShippingBranchService";
import {
  mockShippingAddressesArray,
  mockShippingAddressesResponseWithData,
  mockShippingAddressesResponseWithSuccess,
  mockCompanyId,
  mockUserId,
} from "@/lib/api/services/ShippingBranchService/ShippingBranchService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("ShippingBranchService", () => {
  let shippingBranchService: ShippingBranchService;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    shippingBranchService = new ShippingBranchService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getShippingAddresses", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockShippingAddressesArray);

      const result = await shippingBranchService.getShippingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/branches/readShippingBranch/${mockUserId}?companyId=${mockCompanyId}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockShippingAddressesArray);
    });

    it("should return array when response is array", async () => {
      callApiSpy.mockResolvedValueOnce(mockShippingAddressesArray);

      const result = await shippingBranchService.getShippingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockShippingAddressesArray);
    });

    it("should extract data from response object with data property", async () => {
      callApiSpy.mockResolvedValueOnce(mockShippingAddressesResponseWithData);

      const result = await shippingBranchService.getShippingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockShippingAddressesArray);
    });

    it("should extract data from response object with success property", async () => {
      callApiSpy.mockResolvedValueOnce(
        mockShippingAddressesResponseWithSuccess
      );

      const result = await shippingBranchService.getShippingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockShippingAddressesArray);
    });

    it("should return empty array when response structure is invalid", async () => {
      callApiSpy.mockResolvedValueOnce({ invalid: "structure" });

      const result = await shippingBranchService.getShippingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it("should return empty array when data is not an array", async () => {
      callApiSpy.mockResolvedValueOnce({ data: "not an array" });

      const result = await shippingBranchService.getShippingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        shippingBranchService.getShippingAddresses(mockUserId, mockCompanyId)
      ).rejects.toThrow("API Error");
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockShippingAddressesArray);

      await shippingBranchService.getShippingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });
});
