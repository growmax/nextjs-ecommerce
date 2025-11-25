import { BaseService } from "@/lib/api/services/BaseService";
import { BillingBranchService } from "@/lib/api/services/BillingBranchService/BillingBranchService";
import {
  mockBillingAddressesArray,
  mockBillingAddressesResponseWithData,
  mockBillingAddressesResponseWithSuccess,
  mockCompanyId,
  mockUserId,
} from "@/lib/api/services/BillingBranchService/BillingBranchService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("BillingBranchService", () => {
  let billingBranchService: BillingBranchService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    billingBranchService = new BillingBranchService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getBillingAddresses", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockBillingAddressesArray);

      const result = await billingBranchService.getBillingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/branches/readBillingBranch/${mockUserId}?companyId=${mockCompanyId}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockBillingAddressesArray);
    });

    it("should return array when response is array", async () => {
      callApiSpy.mockResolvedValueOnce(mockBillingAddressesArray);

      const result = await billingBranchService.getBillingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockBillingAddressesArray);
    });

    it("should extract data from response object with data property", async () => {
      callApiSpy.mockResolvedValueOnce(mockBillingAddressesResponseWithData);

      const result = await billingBranchService.getBillingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockBillingAddressesArray);
    });

    it("should extract data from response object with success property", async () => {
      callApiSpy.mockResolvedValueOnce(mockBillingAddressesResponseWithSuccess);

      const result = await billingBranchService.getBillingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockBillingAddressesArray);
    });

    it("should return empty array when response structure is invalid", async () => {
      callApiSpy.mockResolvedValueOnce({ invalid: "structure" });

      const result = await billingBranchService.getBillingAddresses(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it("should return empty array when data is not an array", async () => {
      callApiSpy.mockResolvedValueOnce({ data: "not an array" });

      const result = await billingBranchService.getBillingAddresses(
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
        billingBranchService.getBillingAddresses(mockUserId, mockCompanyId)
      ).rejects.toThrow("API Error");
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockBillingAddressesArray);

      await billingBranchService.getBillingAddresses(mockUserId, mockCompanyId);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("getBillingAddressesServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockBillingAddressesArray);

      const result = await billingBranchService.getBillingAddressesServerSide(
        mockUserId,
        mockCompanyId
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        `/branches/readBillingBranch/${mockUserId}?companyId=${mockCompanyId}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockBillingAddressesArray);
    });

    it("should return array when response is array", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockBillingAddressesArray);

      const result = await billingBranchService.getBillingAddressesServerSide(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockBillingAddressesArray);
    });

    it("should extract data from response object with data property", async () => {
      callApiSafeSpy.mockResolvedValueOnce(
        mockBillingAddressesResponseWithData
      );

      const result = await billingBranchService.getBillingAddressesServerSide(
        mockUserId,
        mockCompanyId
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockBillingAddressesArray);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await billingBranchService.getBillingAddressesServerSide(
        mockUserId,
        mockCompanyId
      );

      expect(result).toBeNull();
    });

    it("should return null when data is not an array", async () => {
      callApiSafeSpy.mockResolvedValueOnce({ data: "not an array" });

      const result = await billingBranchService.getBillingAddressesServerSide(
        mockUserId,
        mockCompanyId
      );

      expect(result).toBeNull();
    });
  });

  describe("updateBillingAddress", () => {
    it("should call API with correct endpoint and PUT method", async () => {
      const mockUpdatedAddress = mockBillingAddressesArray[0];
      callApiSpy.mockResolvedValueOnce(mockUpdatedAddress);

      const result = await billingBranchService.updateBillingAddress(
        mockCompanyId,
        "1"
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/branches/updateBillingAddress/${mockCompanyId}`,
        { addressId: "1" },
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
      expect(result).toEqual(mockUpdatedAddress);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        billingBranchService.updateBillingAddress(mockCompanyId, "1")
      ).rejects.toThrow("API Error");
    });
  });
});
