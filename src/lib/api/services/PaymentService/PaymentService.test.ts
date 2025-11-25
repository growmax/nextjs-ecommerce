import { BaseService } from "@/lib/api/services/BaseService";
import { PaymentService } from "@/lib/api/services/PaymentService/PaymentService";
import {
  mockOrderIdentifier,
  mockOverallPaymentsResponse,
  mockPaymentDueResponse,
  mockPaymentTermsResponse,
  mockPaymentTermsResponseEmpty,
} from "@/lib/api/services/PaymentService/PaymentService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("PaymentService", () => {
  let paymentService: PaymentService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    paymentService = new PaymentService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("fetchOverallPaymentsByOrder", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockOverallPaymentsResponse);

      const result =
        await paymentService.fetchOverallPaymentsByOrder(mockOrderIdentifier);

      expect(callApiSpy).toHaveBeenCalledWith(
        `payment/fetchOverallPaymentTowardsOrder?orderIdentifier=${mockOrderIdentifier}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockOverallPaymentsResponse);
    });

    it("should return OverallPaymentsResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockOverallPaymentsResponse);

      const result =
        await paymentService.fetchOverallPaymentsByOrder(mockOrderIdentifier);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        paymentService.fetchOverallPaymentsByOrder(mockOrderIdentifier)
      ).rejects.toThrow("API Error");
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockOverallPaymentsResponse);

      await paymentService.fetchOverallPaymentsByOrder(mockOrderIdentifier);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("fetchPaymentDueByOrder", () => {
    it("should call API with correct endpoint and encoded orderIdentifier", async () => {
      callApiSpy.mockResolvedValueOnce(mockPaymentDueResponse);

      const result =
        await paymentService.fetchPaymentDueByOrder(mockOrderIdentifier);

      expect(callApiSpy).toHaveBeenCalledWith(
        `paymentDueCalculation/fetchByOrder?orderIdentifier=${encodeURIComponent(mockOrderIdentifier)}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockPaymentDueResponse);
    });

    it("should encode special characters in orderIdentifier", async () => {
      const specialIdentifier = "ORD-001 & Special";
      callApiSpy.mockResolvedValueOnce(mockPaymentDueResponse);

      await paymentService.fetchPaymentDueByOrder(specialIdentifier);

      expect(callApiSpy).toHaveBeenCalledWith(
        `paymentDueCalculation/fetchByOrder?orderIdentifier=${encodeURIComponent(specialIdentifier)}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should return PaymentDueResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockPaymentDueResponse);

      const result =
        await paymentService.fetchPaymentDueByOrder(mockOrderIdentifier);

      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        paymentService.fetchPaymentDueByOrder(mockOrderIdentifier)
      ).rejects.toThrow("API Error");
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockPaymentDueResponse);

      await paymentService.fetchPaymentDueByOrder(mockOrderIdentifier);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("fetchPaymentDueByOrderServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockPaymentDueResponse);

      const result =
        await paymentService.fetchPaymentDueByOrderServerSide(
          mockOrderIdentifier
        );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        `paymentDueCalculation/fetchByOrder?orderIdentifier=${encodeURIComponent(mockOrderIdentifier)}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockPaymentDueResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result =
        await paymentService.fetchPaymentDueByOrderServerSide(
          mockOrderIdentifier
        );

      expect(result).toBeNull();
    });
  });

  describe("fetchPaymentTerms", () => {
    it("should call API with correct endpoint for number userId", async () => {
      callApiSpy.mockResolvedValueOnce(mockPaymentTermsResponse);

      const result = await paymentService.fetchPaymentTerms(123);

      expect(callApiSpy).toHaveBeenCalledWith(
        "PaymentTerms/fetchPaymentTerms?userId=123&isB2C=false",
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockPaymentTermsResponse);
    });

    it("should call API with correct endpoint for string userId", async () => {
      callApiSpy.mockResolvedValueOnce(mockPaymentTermsResponse);

      const result = await paymentService.fetchPaymentTerms("123");

      expect(callApiSpy).toHaveBeenCalledWith(
        "PaymentTerms/fetchPaymentTerms?userId=123&isB2C=false",
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockPaymentTermsResponse);
    });

    it("should return PaymentTermsResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockPaymentTermsResponse);

      const result = await paymentService.fetchPaymentTerms(123);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should handle empty payment terms", async () => {
      callApiSpy.mockResolvedValueOnce(mockPaymentTermsResponseEmpty);

      const result = await paymentService.fetchPaymentTerms(123);

      expect(result.data).toEqual([]);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(paymentService.fetchPaymentTerms(123)).rejects.toThrow(
        "API Error"
      );
    });

    it("should use POST method", async () => {
      callApiSpy.mockResolvedValueOnce(mockPaymentTermsResponse);

      await paymentService.fetchPaymentTerms(123);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });
  });

  describe("fetchPaymentTermsServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockPaymentTermsResponse);

      const result = await paymentService.fetchPaymentTermsServerSide(123);

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "PaymentTerms/fetchPaymentTerms?userId=123&isB2C=false",
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockPaymentTermsResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await paymentService.fetchPaymentTermsServerSide(123);

      expect(result).toBeNull();
    });

    it("should handle string userId", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockPaymentTermsResponse);

      const result = await paymentService.fetchPaymentTermsServerSide("123");

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "PaymentTerms/fetchPaymentTerms?userId=123&isB2C=false",
        {},
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockPaymentTermsResponse);
    });
  });
});
