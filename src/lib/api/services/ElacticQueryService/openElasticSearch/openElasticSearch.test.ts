// Mock dependencies before importing the service
jest.mock("../../../client", () => ({
  elasticClient: {
    callWith: jest.fn(),
    callWithSafe: jest.fn(),
  },
}));

jest.mock("../../BaseService", () => {
  class MockBaseService {
    callWith = jest.fn();
    callWithSafe = jest.fn();
    static getInstance() {
      return new MockBaseService();
    }
  }
  return { BaseService: MockBaseService };
});

jest.mock("@/utils/opensearch/response-parser", () => ({
  extractOpenSearchData: jest.fn(),
}));

jest.mock("../query-builder/query-builder", () => ({
  buildProductSearchQuery: jest.fn(),
}));

jest.mock("../response-utils/response-utils", () => ({
  createErrorSearchResponse: jest.fn(),
  formatProductSearchResponse: jest.fn(),
}));

jest.mock("@/lib/cache", () => ({
  withRedisCache: jest.fn(),
}));

import { OpenElasticSearchService } from "./openElasticSearch";
import { extractOpenSearchData } from "@/utils/opensearch/response-parser";
import { buildProductSearchQuery } from "../query-builder/query-builder";
import {
  formatProductSearchResponse,
  createErrorSearchResponse,
} from "../response-utils/response-utils";
// import type { RequestContext } from '../../../client';

// Import mocks
import {
  mockIdentifier,
  mockElasticIndex,
  mockElasticType,
  mockQueryType,
  mockRequestContext,
  mockProductSearchOptions,
  mockSearchTerm,
  mockProductDetail,
  mockProductSearchResponse,
  mockErrorResponse,
  mockOpenSearchResponse,
} from "./openElasticSearch.mocks";

describe("OpenElasticSearchService", () => {
  let service: OpenElasticSearchService;

  beforeAll(() => {
    (global as any).window = undefined;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OpenElasticSearchService();
  });

  describe("getProduct", () => {
    it("should fetch a single product successfully", async () => {
      const mockResponse = { data: mockProductDetail };
      ((service as any).callWith as jest.Mock).mockResolvedValue(mockResponse);
      (extractOpenSearchData as jest.Mock).mockReturnValue(mockProductDetail);

      const result = await service.getProduct(
        mockIdentifier,
        mockElasticIndex,
        mockElasticType,
        mockQueryType,
        mockRequestContext
      );

      expect((service as any).callWith).toHaveBeenCalledWith(
        "",
        {
          Elasticindex: mockElasticIndex,
          ElasticBody: mockIdentifier,
          ElasticType: mockElasticType,
          queryType: mockQueryType,
        },
        {
          method: "POST",
          context: mockRequestContext,
        }
      );
      expect(extractOpenSearchData).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockProductDetail);
    });

    it("should fetch a product without optional parameters", async () => {
      const mockResponse = { data: mockProductDetail };
      ((service as any).callWith as jest.Mock).mockResolvedValue(mockResponse);
      (extractOpenSearchData as jest.Mock).mockReturnValue(mockProductDetail);

      const result = await service.getProduct(mockIdentifier, mockElasticIndex);

      expect((service as any).callWith).toHaveBeenCalledWith(
        "",
        {
          Elasticindex: mockElasticIndex,
          ElasticBody: mockIdentifier,
          ElasticType: "pgproduct",
          queryType: "get",
        },
        {
          method: "POST",
        }
      );
      expect(result).toEqual(mockProductDetail);
    });

    it("should return null if extraction fails", async () => {
      const mockResponse = { data: null };
      ((service as any).callWith as jest.Mock).mockResolvedValue(mockResponse);
      (extractOpenSearchData as jest.Mock).mockReturnValue(null);

      const result = await service.getProduct(mockIdentifier, mockElasticIndex);

      expect(result).toBeNull();
    });
  });

  describe("getProductServerSide", () => {
    it("should fetch a product server-side successfully", async () => {
      const mockResponse = { data: mockProductDetail };
      ((service as any).callWithSafe as jest.Mock).mockResolvedValue(
        mockResponse
      );
      (extractOpenSearchData as jest.Mock).mockReturnValue(mockProductDetail);

      const result = await service.getProductServerSide(
        mockIdentifier,
        mockElasticIndex,
        mockElasticType,
        mockQueryType,
        mockRequestContext
      );

      expect((service as any).callWithSafe).toHaveBeenCalledWith(
        "",
        {
          Elasticindex: mockElasticIndex,
          ElasticBody: mockIdentifier,
          ElasticType: mockElasticType,
          queryType: mockQueryType,
        },
        {
          method: "POST",
          context: mockRequestContext,
        }
      );
      expect(extractOpenSearchData).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockProductDetail);
    });

    it("should handle null response", async () => {
      ((service as any).callWithSafe as jest.Mock).mockResolvedValue(null);
      (extractOpenSearchData as jest.Mock).mockReturnValue(null);

      const result = await service.getProductServerSide(
        mockIdentifier,
        mockElasticIndex
      );

      expect(result).toBeNull();
    });
  });

  describe("getProductCached", () => {
    it("should fetch product using server-side method", async () => {
      ((service as any).callWithSafe as jest.Mock).mockResolvedValue(
        mockOpenSearchResponse
      );
      (extractOpenSearchData as jest.Mock).mockReturnValue(mockProductDetail);

      const result = await service.getProductCached(
        mockIdentifier,
        mockElasticIndex,
        mockElasticType,
        mockQueryType,
        mockRequestContext
      );

      expect((service as any).callWithSafe).toHaveBeenCalledWith(
        "",
        {
          Elasticindex: mockElasticIndex,
          ElasticBody: mockIdentifier,
          ElasticType: mockElasticType,
          queryType: mockQueryType,
        },
        {
          method: "POST",
          context: mockRequestContext,
        }
      );
      expect(extractOpenSearchData).toHaveBeenCalledWith(
        mockOpenSearchResponse
      );
      expect(result).toEqual(mockProductDetail);
    });

    it("should handle null response", async () => {
      ((service as any).callWithSafe as jest.Mock).mockResolvedValue(null);
      (extractOpenSearchData as jest.Mock).mockReturnValue(null);

      const result = await service.getProductCached(
        mockIdentifier,
        mockElasticIndex
      );

      expect(result).toBeNull();
    });
  });

  describe("searchProducts", () => {
    it("should search products successfully", async () => {
      const mockQuery = { query: { match: { name: mockSearchTerm } } };
      const mockResponse = mockOpenSearchResponse;

      (buildProductSearchQuery as jest.Mock).mockReturnValue(mockQuery);
      ((service as any).callWith as jest.Mock).mockResolvedValue(mockResponse);
      (formatProductSearchResponse as jest.Mock).mockReturnValue(
        mockProductSearchResponse
      );

      const result = await service.searchProducts(
        mockSearchTerm,
        mockElasticIndex,
        mockProductSearchOptions,
        mockRequestContext
      );

      expect(buildProductSearchQuery).toHaveBeenCalledWith(
        mockSearchTerm,
        mockElasticIndex,
        mockProductSearchOptions
      );
      expect((service as any).callWith).toHaveBeenCalledWith("", mockQuery, {
        method: "POST",
        context: mockRequestContext,
      });
      expect(formatProductSearchResponse).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockProductSearchResponse);
    });

    it("should handle search error and return error response", async () => {
      const mockQuery = { query: { match: { name: mockSearchTerm } } };

      (buildProductSearchQuery as jest.Mock).mockReturnValue(mockQuery);
      ((service as any).callWith as jest.Mock).mockRejectedValue(
        new Error("Search failed")
      );
      (createErrorSearchResponse as jest.Mock).mockReturnValue(
        mockErrorResponse
      );

      const result = await service.searchProducts(
        mockSearchTerm,
        mockElasticIndex
      );

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe("searchProductsServerSide", () => {
    it("should search products server-side successfully", async () => {
      const mockQuery = { query: { match: { name: mockSearchTerm } } };
      const mockResponse = mockOpenSearchResponse;

      (buildProductSearchQuery as jest.Mock).mockReturnValue(mockQuery);
      ((service as any).callWithSafe as jest.Mock).mockResolvedValue(
        mockResponse
      );
      (formatProductSearchResponse as jest.Mock).mockReturnValue(
        mockProductSearchResponse
      );

      const result = await service.searchProductsServerSide(
        mockSearchTerm,
        mockElasticIndex,
        mockProductSearchOptions,
        mockRequestContext
      );

      expect(buildProductSearchQuery).toHaveBeenCalledWith(
        mockSearchTerm,
        mockElasticIndex,
        mockProductSearchOptions
      );
      expect((service as any).callWithSafe).toHaveBeenCalledWith(
        "",
        mockQuery,
        {
          method: "POST",
          context: mockRequestContext,
        }
      );
      expect(formatProductSearchResponse).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockProductSearchResponse);
    });

    it("should return error response if response is null", async () => {
      const mockQuery = { query: { match: { name: mockSearchTerm } } };

      (buildProductSearchQuery as jest.Mock).mockReturnValue(mockQuery);
      ((service as any).callWithSafe as jest.Mock).mockResolvedValue(null);
      (createErrorSearchResponse as jest.Mock).mockReturnValue(
        mockErrorResponse
      );

      const result = await service.searchProductsServerSide(
        mockSearchTerm,
        mockElasticIndex
      );

      expect(result).toEqual(mockErrorResponse);
    });
  });
});
