import {
  buildProductSearchQuery,
  getProductSearchFields,
  getProductSourceFields,
} from "@/lib/api/services/ElasticQueryService/query-builder/query-builder";
import {
  mockElasticIndex,
  mockExpectedSearchRequest,
  mockProductSearchFields,
  mockProductSearchOptions,
  mockProductSourceFields,
  mockSearchTerm,
} from "@/lib/api/services/ElasticQueryService/query-builder/query-builder.mocks";

describe("Query Builder", () => {
  describe("buildProductSearchQuery", () => {
    it("should build search query with default options", () => {
      const result = buildProductSearchQuery(mockSearchTerm, mockElasticIndex);
      expect(result).toEqual(mockExpectedSearchRequest);
    });

    it("should build search query with custom options", () => {
      const result = buildProductSearchQuery(
        mockSearchTerm,
        mockElasticIndex,
        mockProductSearchOptions
      );
      expect(result.ElasticBody.size).toBe(10);
      expect(result.ElasticBody.from).toBe(5);
    });

    it("should include published filter", () => {
      const result = buildProductSearchQuery(mockSearchTerm, mockElasticIndex);
      expect(result.ElasticBody.query.bool.must[0]).toEqual({
        term: { isPublished: 1 },
      });
    });

    it("should include multi-match query", () => {
      const result = buildProductSearchQuery(mockSearchTerm, mockElasticIndex);
      expect(result.ElasticBody.query.bool.must[1]).toEqual({
        multi_match: {
          query: mockSearchTerm,
          fields: mockProductSearchFields,
          type: "best_fields",
        },
      });
    });
  });

  describe("getProductSourceFields", () => {
    it("should return source fields array", () => {
      const result = getProductSourceFields();
      expect(result).toEqual(mockProductSourceFields);
    });
  });

  describe("getProductSearchFields", () => {
    it("should return search fields array", () => {
      const result = getProductSearchFields();
      expect(result).toEqual(mockProductSearchFields);
    });
  });
});
