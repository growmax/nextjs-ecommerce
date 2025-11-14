// Mock axios before importing SearchService
jest.mock("axios", () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
    },
  };
});

import axios from "axios";
import { SearchService, ElasticSearchResponse } from "./SearchService";
import {
  mockContext,
  mockElasticSearchOptions,
  mockElasticSearchResponse,
  mockFormattedProduct,
} from "./SearchService.mocks";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SearchService", () => {
  let searchService: SearchService;
  let mockAxiosInstance: {
    post: jest.Mock;
    interceptors: {
      request: {
        use: jest.Mock;
      };
    };
  };

  beforeEach(() => {
    // Reset singleton instance
    (SearchService as any).instance = undefined;

    // Setup mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
      },
    };

    // Mock axios.create to return our mock instance
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    (mockedAxios.create as jest.Mock).mockClear();

    // Now create the service instance
    searchService = SearchService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
    (SearchService as any).instance = undefined;
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = SearchService.getInstance();
      const instance2 = SearchService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("getTokenFromCookie", () => {
    it("should return null on server-side", () => {
      const token = (searchService as any).getTokenFromCookie("access_token");

      expect(token).toBeNull();
    });

    it("should extract token from cookie on client-side", () => {
      // Mock document.cookie
      const originalCookie = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "cookie"
      );
      Object.defineProperty(document, "cookie", {
        get: jest.fn(() => "access_token=test-token; other=value"),
        configurable: true,
      });

      const token = (searchService as any).getTokenFromCookie("access_token");

      expect(token).toBe("test-token");

      // Restore
      if (originalCookie) {
        Object.defineProperty(document, "cookie", originalCookie);
      }
    });

    it("should return null if cookie not found", () => {
      // Mock document.cookie
      const originalCookie = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "cookie"
      );
      Object.defineProperty(document, "cookie", {
        get: jest.fn(() => "other=value"),
        configurable: true,
      });

      const token = (searchService as any).getTokenFromCookie("access_token");

      expect(token).toBeNull();

      // Restore
      if (originalCookie) {
        Object.defineProperty(document, "cookie", originalCookie);
      }
    });
  });

  describe("formatElasticResults", () => {
    it("should format Elasticsearch response correctly", () => {
      const result = (searchService as any).formatElasticResults(
        mockElasticSearchResponse
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "1",
        productId: 1,
        productName: "Test Product",
      });
    });

    it("should return empty array for invalid response", () => {
      const result = (searchService as any).formatElasticResults({});

      expect(result).toEqual([]);
    });

    it("should use fallback fields", () => {
      const response: ElasticSearchResponse = {
        hits: {
          hits: [
            {
              _id: "1",
              _source: {
                productId: 1,
                productShortDescription: "Short",
                brandsName: "Brand",
              } as any,
            },
          ],
          total: { value: 1, relation: "eq" },
        },
      };

      const result = (searchService as any).formatElasticResults(response);

      expect(result[0].shortDescription).toBe("Short");
      expect(result[0].brandName).toBe("Brand");
    });
  });

  describe("searchProducts", () => {
    it("should search products successfully", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      const result = await searchService.searchProducts(
        mockElasticSearchOptions
      );

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "",
        expect.objectContaining({
          Elasticindex: "test-index",
          queryType: "search",
        }),
        expect.any(Object)
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it("should add catalog codes to query", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.searchProducts({
        ...mockElasticSearchOptions,
        catalogCodes: ["CAT-001", "CAT-002"],
      });

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody.ElasticBody.query.bool.must).toContainEqual({
        terms: {
          "catalogCode.keyword": ["CAT-001", "CAT-002"],
        },
      });
    });

    it("should add equipment codes to query", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.searchProducts({
        ...mockElasticSearchOptions,
        equipmentCodes: ["EQ-001"],
      });

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody.ElasticBody.query.bool.must).toContainEqual({
        terms: {
          "catalogCode.keyword": ["EQ-001"],
        },
      });
    });

    it("should add context headers", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.searchProducts({
        ...mockElasticSearchOptions,
        context: mockContext as any,
      });

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const headers = callArgs[2].headers;
      expect(headers.Authorization).toBe("Bearer mock-token");
      expect(headers["x-tenant"]).toBe("tenant-1");
      expect(headers["x-company-id"]).toBe("456");
      expect(headers["x-user-id"]).toBe("123");
    });

    it("should return empty results on error", async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error("API Error"));

      const result = await searchService.searchProducts(
        mockElasticSearchOptions
      );

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("searchProductsByText", () => {
    it("should build text search query correctly", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.searchProductsByText(
        "test query",
        "test-index",
        { limit: 10, offset: 5 },
        mockContext as any
      );

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody.ElasticBody.query.bool.must).toContainEqual({
        multi_match: expect.objectContaining({
          query: "test query",
          fields: expect.arrayContaining(["brandProductId^3", "productName^2"]),
        }),
      });
      expect(requestBody.ElasticBody.size).toBe(10);
      expect(requestBody.ElasticBody.from).toBe(5);
    });

    it("should use default limit and offset", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.searchProductsByText("test", "test-index");

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody.ElasticBody.size).toBe(20);
      expect(requestBody.ElasticBody.from).toBe(0);
    });
  });

  describe("getProductById", () => {
    it("should get product by ID", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      const result = await searchService.getProductById(1, "test-index");

      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(result).toEqual(mockFormattedProduct);
    });

    it("should handle string product ID", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.getProductById("1", "test-index");

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody.ElasticBody.query.bool.must).toContainEqual({
        term: {
          productId: 1,
        },
      });
    });

    it("should return null if product not found", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          hits: {
            hits: [],
            total: { value: 0, relation: "eq" },
          },
        },
      });

      const result = await searchService.getProductById(999, "test-index");

      expect(result).toBeNull();
    });
  });

  describe("getProductsByIds", () => {
    it("should get multiple products by IDs", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      const result = await searchService.getProductsByIds(
        [1, 2, 3],
        "test-index"
      );

      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it("should return empty array for empty product IDs", async () => {
      const result = await searchService.getProductsByIds([], "test-index");

      expect(result).toEqual([]);
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });

    it("should return empty array for null product IDs", async () => {
      const result = await searchService.getProductsByIds(
        null as any,
        "test-index"
      );

      expect(result).toEqual([]);
    });
  });

  describe("advancedSearch", () => {
    it("should build advanced search query with all filters", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.advancedSearch(
        {
          searchText: "test",
          brandIds: [1, 2],
          categoryIds: ["cat-1"],
          minPrice: 10,
          maxPrice: 100,
          inStock: true,
          limit: 15,
          offset: 5,
        },
        "test-index"
      );

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      const query = requestBody.ElasticBody.query.bool;

      expect(query.must).toContainEqual({
        multi_match: expect.objectContaining({
          query: "test",
        }),
      });
      expect(query.filter).toContainEqual({
        terms: { brandId: [1, 2] },
      });
      expect(query.filter).toContainEqual({
        terms: { "categoryId.keyword": ["cat-1"] },
      });
      expect(query.filter).toContainEqual({
        range: { unitPrice: { gte: 10, lte: 100 } },
      });
      expect(query.filter).toContainEqual({
        term: { inStock: true },
      });
    });

    it("should use match_all when no search text", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.advancedSearch(
        {
          brandIds: [1],
        },
        "test-index"
      );

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody.ElasticBody.query.bool.must).toContainEqual({
        match_all: {},
      });
    });

    it("should sort by score when search text provided", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.advancedSearch(
        {
          searchText: "test",
        },
        "test-index"
      );

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody.ElasticBody.sort).toEqual([
        { _score: { order: "desc" } },
      ]);
    });

    it("should sort by productId when no search text", async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockElasticSearchResponse,
      });

      await searchService.advancedSearch({}, "test-index");

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody.ElasticBody.sort).toEqual([
        { productId: { order: "desc" } },
      ]);
    });
  });
});
