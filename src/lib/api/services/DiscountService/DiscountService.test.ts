import { BaseService } from "@/lib/api/services/BaseService";
import { DiscountService } from "@/lib/api/services/DiscountService/DiscountService";
import {
  mockCheckVolumeDiscountEnabledResponse,
  mockDiscountApiResponse,
  mockDiscountRequest,
  mockDiscountRequestWithContext,
  mockGetAllSellerPricesRequest,
  mockGetAllSellerPricesResponse,
} from "@/lib/api/services/DiscountService/DiscountService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  discountClient: {},
  RequestContext: {},
}));

describe("DiscountService", () => {
  let discountService: DiscountService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;
  let callWithSpy: jest.SpyInstance;
  let callWithSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    discountService = new DiscountService();
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

  describe("getDiscount", () => {
    it("should call API with correct endpoint and context", async () => {
      callWithSpy.mockResolvedValueOnce(mockDiscountApiResponse);

      const result = await discountService.getDiscount(
        mockDiscountRequestWithContext
      );

      expect(callWithSpy).toHaveBeenCalledWith(
        `/discount/getDiscount?CompanyId=${mockDiscountRequestWithContext.body.companyId}`,
        {
          Productid: mockDiscountRequestWithContext.body.Productid,
          CurrencyId: mockDiscountRequestWithContext.body.CurrencyId,
          BaseCurrencyId: mockDiscountRequestWithContext.body.BaseCurrencyId,
        },
        {
          method: "POST",
          context: expect.objectContaining({
            userId: mockDiscountRequestWithContext.userId,
            companyId: mockDiscountRequestWithContext.body.companyId,
            tenantCode: mockDiscountRequestWithContext.tenantId,
          }),
        }
      );
      expect(result).toEqual(mockDiscountApiResponse);
    });

    it("should exclude companyId and currencyCode from body", async () => {
      callWithSpy.mockResolvedValueOnce(mockDiscountApiResponse);

      await discountService.getDiscount(mockDiscountRequestWithContext);

      expect(callWithSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          companyId: expect.anything(),
          currencyCode: expect.anything(),
        }),
        expect.any(Object)
      );
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callWithSpy.mockRejectedValueOnce(error);

      await expect(
        discountService.getDiscount(mockDiscountRequestWithContext)
      ).rejects.toThrow("API Error");
    });
  });

  describe("getDiscountLegacy", () => {
    it("should call API with legacy endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockDiscountApiResponse);

      const result =
        await discountService.getDiscountLegacy(mockDiscountRequest);

      expect(callApiSpy).toHaveBeenCalledWith(
        `/discount/getDiscount`,
        mockDiscountRequest,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockDiscountApiResponse);
    });
  });

  describe("getAllSellerPrices", () => {
    it("should call API with correct endpoint", async () => {
      callWithSpy.mockResolvedValueOnce(mockGetAllSellerPricesResponse);

      const result = await discountService.getAllSellerPrices(
        mockGetAllSellerPricesRequest
      );

      expect(callWithSpy).toHaveBeenCalledWith(
        "/discounts/discount/getAllSellerPrices",
        mockGetAllSellerPricesRequest,
        {
          method: "POST",
        }
      );
      expect(result).toEqual(mockGetAllSellerPricesResponse);
    });
  });

  describe("getAllSellerPricesServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callWithSafeSpy.mockResolvedValueOnce(mockGetAllSellerPricesResponse);

      const result = await discountService.getAllSellerPricesServerSide(
        mockGetAllSellerPricesRequest
      );

      expect(callWithSafeSpy).toHaveBeenCalledWith(
        "/discounts/discount/getAllSellerPrices",
        mockGetAllSellerPricesRequest,
        {
          method: "POST",
        }
      );
      expect(result).toEqual(mockGetAllSellerPricesResponse);
    });

    it("should return null on error", async () => {
      callWithSafeSpy.mockResolvedValueOnce(null);

      const result = await discountService.getAllSellerPricesServerSide(
        mockGetAllSellerPricesRequest
      );

      expect(result).toBeNull();
    });
  });

  describe("checkIsVDEnabledByCompanyId", () => {
    it("should call API with correct endpoint for number companyId", async () => {
      callApiSpy.mockResolvedValueOnce(mockCheckVolumeDiscountEnabledResponse);

      const result = await discountService.checkIsVDEnabledByCompanyId(456);

      expect(callApiSpy).toHaveBeenCalledWith(
        `/discount/CheckorderDiscount?CompanyId=456`,
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockCheckVolumeDiscountEnabledResponse);
    });

    it("should call API with correct endpoint for string companyId", async () => {
      callApiSpy.mockResolvedValueOnce(mockCheckVolumeDiscountEnabledResponse);

      const result = await discountService.checkIsVDEnabledByCompanyId("456");

      expect(callApiSpy).toHaveBeenCalledWith(
        `/discount/CheckorderDiscount?CompanyId=456`,
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockCheckVolumeDiscountEnabledResponse);
    });

    it("should use POST method", async () => {
      callApiSpy.mockResolvedValueOnce(mockCheckVolumeDiscountEnabledResponse);

      await discountService.checkIsVDEnabledByCompanyId(456);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });
  });

  describe("checkIsVDEnabledByCompanyIdServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(
        mockCheckVolumeDiscountEnabledResponse
      );

      const result =
        await discountService.checkIsVDEnabledByCompanyIdServerSide(456);

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        `/discount/CheckorderDiscount?CompanyId=456`,
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockCheckVolumeDiscountEnabledResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result =
        await discountService.checkIsVDEnabledByCompanyIdServerSide(456);

      expect(result).toBeNull();
    });
  });

  describe("checkIsVDEnabledByCompanyIdWithContext", () => {
    it("should call safe API with custom context", async () => {
      const mockContext = {};
      callWithSafeSpy.mockResolvedValueOnce(
        mockCheckVolumeDiscountEnabledResponse
      );

      const result =
        await discountService.checkIsVDEnabledByCompanyIdWithContext(
          456,
          mockContext as any
        );

      expect(callWithSafeSpy).toHaveBeenCalledWith(
        `/discount/CheckorderDiscount?CompanyId=456`,
        {},
        {
          context: mockContext,
          method: "POST",
        }
      );
      expect(result).toEqual(mockCheckVolumeDiscountEnabledResponse);
    });
  });
});
