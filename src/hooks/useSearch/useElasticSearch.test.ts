import {
  PRODUCT_SEARCH_FIELDS,
  PRODUCT_SOURCE_FIELDS,
} from "@/hooks/useSearch/useElasticSearch";
import {
  mockProductSearchFields,
  mockProductSourceFields,
} from "@/hooks/useSearch/useElasticSearch.mocks";

describe("useElasticSearch", () => {
  describe("PRODUCT_SEARCH_FIELDS", () => {
    it("should export PRODUCT_SEARCH_FIELDS", () => {
      expect(PRODUCT_SEARCH_FIELDS).toBeDefined();
    });

    it("should have correct search fields", () => {
      expect(PRODUCT_SEARCH_FIELDS).toEqual(mockProductSearchFields);
    });
  });

  describe("PRODUCT_SOURCE_FIELDS", () => {
    it("should export PRODUCT_SOURCE_FIELDS", () => {
      expect(PRODUCT_SOURCE_FIELDS).toBeDefined();
    });

    it("should have correct source fields", () => {
      expect(PRODUCT_SOURCE_FIELDS).toEqual(mockProductSourceFields);
    });
  });
});
