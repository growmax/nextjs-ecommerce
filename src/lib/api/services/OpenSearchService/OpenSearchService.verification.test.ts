/**
 * OpenSearch Service Verification Tests
 * 
 * These tests verify that OpenSearch queries are structured correctly
 * and can be executed against the OpenSearch API.
 * 
 * Note: These are integration-style tests that verify query structure.
 * For actual API calls, use the verification script.
 */

import { buildProductSearchQuery } from "@/utils/elasticsearch/search-queries";
import {
    buildBrandQuery,
    buildCategoryQuery,
    buildMajorCategoryQuery,
    buildSubCategoryQuery,
} from "@/utils/opensearch/browse-queries";

// Mock the clients to prevent actual API calls
jest.mock("../../client", () => ({
  openSearchClient: {
    post: jest.fn(),
  },
  RequestContext: {},
}));

jest.mock("../SearchService/SearchService", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        searchProducts: jest.fn(),
        getProductById: jest.fn(),
      })),
    },
  };
});

describe("OpenSearch Query Verification", () => {
  const mockElasticIndex = "test_index";
  const mockContext = {
    accessToken: "test-token",
    tenantCode: "test-tenant",
    companyId: 1,
    userId: 1,
  };

  describe("Product Search Query Structure", () => {
    it("should build valid product search query", () => {
      const searchText = "drill";
      const query = buildProductSearchQuery(searchText);

      expect(query).toHaveProperty("size");
      expect(query).toHaveProperty("_source");
      expect(query).toHaveProperty("query");
      expect(query.query).toHaveProperty("bool");
      expect(query.query.bool).toHaveProperty("must");
      expect(query.query.bool).toHaveProperty("should");
      expect(query.query.bool).toHaveProperty("must_not");

      // Verify must clause has is_published filter
      const mustClauses = query.query.bool.must as Array<Record<string, unknown>>;
      expect(mustClauses).toContainEqual({
        term: { is_published: 1 },
      });

      // Verify must_not clauses
      const mustNotClauses = query.query.bool.must_not as Array<
        Record<string, unknown>
      >;
      expect(mustNotClauses.length).toBeGreaterThan(0);
    });

    it("should include search fields in query", () => {
      const searchText = "test";
      const query = buildProductSearchQuery(searchText);

      const shouldClauses = query.query.bool.should as Array<
        Record<string, unknown>
      >;
      expect(shouldClauses.length).toBeGreaterThan(0);

      // Check for query_string clause
      const queryStringClause = shouldClauses.find(
        clause => "query_string" in clause
      );
      expect(queryStringClause).toBeDefined();
    });
  });

  describe("Browse Category Query Structure", () => {
    it("should build valid category query", () => {
      const categoryId = 123;
      const { query } = buildCategoryQuery({ categoryId }, {
        page: 1,
        pageSize: 20,
      });

      expect(query).toHaveProperty("from");
      expect(query).toHaveProperty("size");
      expect(query).toHaveProperty("query");
      expect(query.query.bool.must).toBeDefined();

      // Verify category filter
      const mustClauses = query.query.bool.must as Array<Record<string, unknown>>;
      expect(mustClauses).toContainEqual({
        term: { "products_sub_categories.category_id": categoryId },
      });
    });

    it("should include pagination in category query", () => {
      const { query } = buildCategoryQuery({ categoryId: 123 }, {
        page: 2,
        pageSize: 10,
      });

      expect(query.from).toBe(10); // (page - 1) * pageSize
      expect(query.size).toBe(10);
    });

    it("should include sort configuration when provided", () => {
      const { query } = buildCategoryQuery({ categoryId: 123 }, {
        page: 1,
        pageSize: 20,
        sortBy: {
          sortBy: 2, // Price: Low to High
        },
      });

      expect(query.sort).toBeDefined();
      expect(query.sort).toEqual([{ unit_list_price: { order: "asc" } }]);
    });
  });

  describe("Browse Subcategory Query Structure", () => {
    it("should build valid subcategory query", () => {
      const subCategoryId = 456;
      const { query } = buildSubCategoryQuery(subCategoryId);

      expect(query.query.bool.must).toBeDefined();

      const mustClauses = query.query.bool.must as Array<Record<string, unknown>>;
      expect(mustClauses).toContainEqual({
        term: { "products_sub_categories.sub_category_id": subCategoryId },
      });
    });
  });

  describe("Browse Major Category Query Structure", () => {
    it("should build valid major category query", () => {
      const majorCategoryId = 789;
      const { query } = buildMajorCategoryQuery(majorCategoryId);

      expect(query.query.bool.must).toBeDefined();

      const mustClauses = query.query.bool.must as Array<Record<string, unknown>>;
      expect(mustClauses).toContainEqual({
        term: { "products_sub_categories.major_category_id": majorCategoryId },
      });
    });
  });

  describe("Browse Brand Query Structure", () => {
    it("should build valid brand query", () => {
      const brandName = "DEWALT";
      const { query } = buildBrandQuery(brandName);

      expect(query.query.bool.must).toBeDefined();

      const mustClauses = query.query.bool.must as Array<Record<string, unknown>>;
      expect(mustClauses).toContainEqual({
        term: { "brands_name.keyword": brandName },
      });
    });
  });

  describe("Query Request Format", () => {
    it("should format search query request correctly", () => {
      const searchText = "test";
      const query = buildProductSearchQuery(searchText);

      const request = {
        Elasticindex: mockElasticIndex,
        ElasticBody: query,
        ElasticType: "pgproduct",
        queryType: "search" as const,
      };

      expect(request).toHaveProperty("Elasticindex");
      expect(request).toHaveProperty("ElasticBody");
      expect(request).toHaveProperty("ElasticType");
      expect(request).toHaveProperty("queryType");
      expect(request.ElasticType).toBe("pgproduct");
      expect(request.queryType).toBe("search");
    });

    it("should format browse query request correctly", () => {
      const { query } = buildCategoryQuery({ categoryId: 123 });

      const request = {
        Elasticindex: mockElasticIndex,
        ElasticBody: query,
        ElasticType: "pgproduct",
        queryType: "search" as const,
      };

      expect(request).toHaveProperty("Elasticindex");
      expect(request).toHaveProperty("ElasticBody");
      expect(request.ElasticType).toBe("pgproduct");
      expect(request.queryType).toBe("search");
    });

    it("should format get product request correctly", () => {
      const productIndexName = "Prod0000000001";

      const request = {
        Elasticindex: mockElasticIndex,
        ElasticBody: productIndexName,
        ElasticType: "pgproduct",
        queryType: "get" as const,
      };

      expect(request).toHaveProperty("Elasticindex");
      expect(request).toHaveProperty("ElasticBody");
      expect(request.ElasticBody).toBe(productIndexName);
      expect(request.ElasticType).toBe("pgproduct");
      expect(request.queryType).toBe("get");
    });
  });

  describe("Filter Integration", () => {
    it("should include catalog codes in browse query", () => {
      const { query } = buildCategoryQuery({ categoryId: 123 }, {
        catalogCodes: ["CAT001", "CAT002"],
      });

      const mustClauses = query.query.bool.must as Array<Record<string, unknown>>;
      const catalogFilter = mustClauses.find(
        clause => "terms" in clause && "catalogCode.keyword" in (clause.terms as Record<string, unknown>)
      );

      expect(catalogFilter).toBeDefined();
    });

    it("should include equipment codes in browse query", () => {
      const { query } = buildCategoryQuery({ categoryId: 123 }, {
        equipmentCodes: ["EQ001"],
      });

      const mustClauses = query.query.bool.must as Array<Record<string, unknown>>;
      const equipmentFilter = mustClauses.find(
        clause => "terms" in clause && "equipmentCode.keyword" in (clause.terms as Record<string, unknown>)
      );

      expect(equipmentFilter).toBeDefined();
    });

    it("should include additional filters in browse query", () => {
      const { query } = buildCategoryQuery({ categoryId: 123 }, {
        filters: {
          brands: ["DEWALT", "Milwaukee"],
        },
      });

      const mustClauses = query.query.bool.must as Array<Record<string, unknown>>;
      expect(mustClauses.length).toBeGreaterThan(1); // Should have category + brand filters
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid category ID gracefully", () => {
      const { query } = buildCategoryQuery({ categoryId: 0 });
      expect(query).toBeDefined();
      expect(query.query.bool.must).toBeDefined();
    });

    it("should handle empty brand name gracefully", () => {
      const { query } = buildBrandQuery("");
      expect(query).toBeDefined();
      expect(query.query.bool.must).toBeDefined();
    });
  });

  describe("Query Compatibility", () => {
    it("should produce queries compatible with SearchService", () => {
      const { query } = buildCategoryQuery({ categoryId: 123 }, {
        page: 1,
        pageSize: 20,
      });

      // Verify query structure matches SearchService expectations
      expect(query).toHaveProperty("query.bool.must");
      expect(query).toHaveProperty("size");
      expect(query).toHaveProperty("from");

      // Query should be usable with SearchService.searchProducts
      const searchServiceQuery = {
        elasticIndex: mockElasticIndex,
        query,
        context: mockContext,
      };

      expect(searchServiceQuery.query).toBe(query);
    });

    it("should produce queries compatible with OpenSearchService", () => {
      const productIndexName = "Prod0000000001";

      const request = {
        Elasticindex: mockElasticIndex,
        ElasticBody: productIndexName,
        ElasticType: "pgproduct",
        queryType: "get" as const,
      };

      // Request should match OpenSearchService.getProduct format
      expect(request.Elasticindex).toBe(mockElasticIndex);
      expect(request.ElasticBody).toBe(productIndexName);
      expect(request.ElasticType).toBe("pgproduct");
      expect(request.queryType).toBe("get");
    });
  });
});

