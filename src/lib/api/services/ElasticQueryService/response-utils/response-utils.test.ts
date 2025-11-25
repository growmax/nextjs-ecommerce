import {
  extractSearchHits,
  extractSearchTotal,
  formatProductSearchResponse,
  createErrorSearchResponse,
} from "@/lib/api/services/ElasticQueryService/response-utils/response-utils";

import {
  mockValidSearchResponse,
  mockEmptySearchResponse,
  mockInvalidResponse,
  mockMalformedResponse,
  mockExpectedFormattedResponse,
  mockErrorResponse,
} from "@/lib/api/services/ElasticQueryService/response-utils/response-utils.mocks";

describe("OpenSearch Response Utilities", () => {
  describe("extractSearchHits", () => {
    it("should extract hits from valid response", () => {
      const result = extractSearchHits(mockValidSearchResponse);
      expect(result).toEqual(mockExpectedFormattedResponse.data);
    });

    it("should return null for invalid response", () => {
      expect(extractSearchHits(mockInvalidResponse)).toBeNull();
      expect(extractSearchHits({})).toBeNull();
      expect(extractSearchHits(mockMalformedResponse)).toBeNull();
    });

    it("should handle empty hits array", () => {
      const result = extractSearchHits(mockEmptySearchResponse);
      expect(result).toEqual([]);
    });
  });

  describe("extractSearchTotal", () => {
    it("should extract total from valid response", () => {
      const result = extractSearchTotal(mockValidSearchResponse);
      expect(result).toBe(2);
    });

    it("should return 0 for invalid response", () => {
      expect(extractSearchTotal(mockInvalidResponse)).toBe(0);
      expect(extractSearchTotal({})).toBe(0);
      expect(extractSearchTotal(mockMalformedResponse)).toBe(0);
    });
  });

  describe("formatProductSearchResponse", () => {
    it("should format valid response", () => {
      const result = formatProductSearchResponse(mockValidSearchResponse);
      expect(result).toEqual(mockExpectedFormattedResponse);
    });

    it("should handle empty results", () => {
      const result = formatProductSearchResponse(mockEmptySearchResponse);
      expect(result).toEqual({
        success: true,
        data: [],
        total: 0,
      });
    });
  });

  describe("createErrorSearchResponse", () => {
    it("should return error response", () => {
      const result = createErrorSearchResponse();
      expect(result).toEqual(mockErrorResponse);
    });
  });
});
