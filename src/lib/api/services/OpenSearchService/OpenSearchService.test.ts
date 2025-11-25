import { BaseService } from "@/lib/api/services/BaseService";
import { OpenSearchService } from "@/lib/api/services/OpenSearchService/OpenSearchService";
import {
  mockElasticIndex,
  mockElasticType,
  mockIdentifier,
  mockProductDetail,
  mockQueryType,
} from "@/lib/api/services/OpenSearchService/OpenSearchService.mocks";

// Mock the extractOpenSearchData utility
jest.mock("@/utils/opensearch/response-parser", () => ({
  extractOpenSearchData: jest.fn(response => {
    if (response && response._source) {
      return response._source;
    }
    return null;
  }),
}));

// Mock the client
jest.mock("../../client", () => ({
  openSearchClient: {},
  RequestContext: {},
}));

describe("OpenSearchService", () => {
  let openSearchService: OpenSearchService;
  let callWithSpy: jest.SpyInstance;
  let callWithSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    openSearchService = new OpenSearchService();
    callWithSpy = jest.spyOn(BaseService.prototype as any, "callWith");
    callWithSafeSpy = jest.spyOn(BaseService.prototype as any, "callWithSafe");
  });

  afterEach(() => {
    callWithSpy.mockRestore();
    callWithSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getProduct", () => {
    it("should call API with correct body and parameters", async () => {
      callWithSpy.mockResolvedValueOnce({ _source: mockProductDetail });

      const result = await openSearchService.getProduct(
        mockIdentifier,
        mockElasticIndex,
        mockElasticType,
        mockQueryType
      );

      expect(callWithSpy).toHaveBeenCalledWith(
        "",
        {
          Elasticindex: mockElasticIndex,
          ElasticBody: mockIdentifier,
          ElasticType: mockElasticType,
          queryType: mockQueryType,
        },
        {
          method: "POST",
        }
      );
      expect(result).toEqual(mockProductDetail);
    });

    it("should use default elasticType and queryType", async () => {
      callWithSpy.mockResolvedValueOnce({ _source: mockProductDetail });

      await openSearchService.getProduct(mockIdentifier, mockElasticIndex);

      expect(callWithSpy).toHaveBeenCalledWith(
        "",
        expect.objectContaining({
          ElasticType: "pgproduct",
          queryType: "get",
        }),
        expect.any(Object)
      );
    });

    it("should pass context when provided", async () => {
      const mockContext = {};
      callWithSpy.mockResolvedValueOnce({ _source: mockProductDetail });

      await openSearchService.getProduct(
        mockIdentifier,
        mockElasticIndex,
        mockElasticType,
        mockQueryType,
        mockContext as any
      );

      expect(callWithSpy).toHaveBeenCalledWith("", expect.any(Object), {
        method: "POST",
        context: mockContext,
      });
    });

    it("should extract product data from response", async () => {
      callWithSpy.mockResolvedValueOnce({ _source: mockProductDetail });

      const result = await openSearchService.getProduct(
        mockIdentifier,
        mockElasticIndex
      );

      expect(result).toEqual(mockProductDetail);
    });

    it("should return null when response has no data", async () => {
      callWithSpy.mockResolvedValueOnce(null);

      const result = await openSearchService.getProduct(
        mockIdentifier,
        mockElasticIndex
      );

      expect(result).toBeNull();
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callWithSpy.mockRejectedValueOnce(error);

      await expect(
        openSearchService.getProduct(mockIdentifier, mockElasticIndex)
      ).rejects.toThrow("API Error");
    });
  });

  describe("getProductServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callWithSafeSpy.mockResolvedValueOnce({ _source: mockProductDetail });

      const result = await openSearchService.getProductServerSide(
        mockIdentifier,
        mockElasticIndex,
        mockElasticType,
        mockQueryType
      );

      expect(callWithSafeSpy).toHaveBeenCalledWith(
        "",
        {
          Elasticindex: mockElasticIndex,
          ElasticBody: mockIdentifier,
          ElasticType: mockElasticType,
          queryType: mockQueryType,
        },
        {
          method: "POST",
        }
      );
      expect(result).toEqual(mockProductDetail);
    });

    it("should return null on error", async () => {
      callWithSafeSpy.mockResolvedValueOnce(null);

      const result = await openSearchService.getProductServerSide(
        mockIdentifier,
        mockElasticIndex
      );

      expect(result).toBeNull();
    });

    it("should pass context when provided", async () => {
      const mockContext = {};
      callWithSafeSpy.mockResolvedValueOnce({ _source: mockProductDetail });

      await openSearchService.getProductServerSide(
        mockIdentifier,
        mockElasticIndex,
        mockElasticType,
        mockQueryType,
        mockContext as any
      );

      expect(callWithSafeSpy).toHaveBeenCalledWith("", expect.any(Object), {
        method: "POST",
        context: mockContext,
      });
    });
  });

  describe("getProductCached", () => {
    it("should call getProductServerSide on client-side (window is defined)", async () => {
      // In Jest, window is already defined, so it will use client-side path
      callWithSafeSpy.mockResolvedValueOnce({ _source: mockProductDetail });

      const result = await openSearchService.getProductCached(
        mockIdentifier,
        mockElasticIndex
      );

      expect(callWithSafeSpy).toHaveBeenCalled();
      expect(result).toEqual(mockProductDetail);
    });
  });
});
