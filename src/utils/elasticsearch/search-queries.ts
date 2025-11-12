import { z } from "zod";

const searchTextSchema = z.string().min(1, "Search text cannot be empty");

const PRODUCT_SEARCH_FIELDS = [
  "name",
  "keywords^8",
  "brandProductId^5",
  "productShortDescription^9",
  "description",
  "pgName",
  "variantAttributeses.name",
  "productSeries",
  "brandsName",
  "variantAttributeses.options",
  "productSpecifications.key",
  "productSpecifications.value",
  "productGroupSpecifications.key",
  "productGroupSpecifications.value",
  "productsSubCategories.categoryName",
  "productsSubCategories.subCategoryName",
  "productsSubCategories.majorCategoryName",
  "ean",
] as const;

const PRODUCT_SOURCE_FIELDS = [
  "brandProductId",
  "productShortDescription",
  "productAssetss",
  "brandsName",
  "productsSubCategories.subCategoryName",
  "productId",
  "productIndexName",
  "ean",
  "keywords",
  "b2CUnitListPrice",
  "b2CDiscountPrice",
] as const;

const CATEGORY_SEARCH_FIELDS = [
  "brandsName",
  "productsSubCategories.categoryName",
  "productsSubCategories.subCategoryName",
  "productsSubCategories.majorCategoryName",
] as const;

const sanitizeSearchValue = (value: string): string => {
  if (!value) {
    return "";
  }

  return value.replace(/[+\-=&|><!(){}[\]^"~*?:\\/]/g, "\\$&");
};

export interface ElasticSearchQuery {
  size: number;
  _source: readonly string[];
  query: {
    bool: {
      minimum_should_match: number;
      must: Array<{
        term: {
          isPublished: number;
        };
      }>;
      should: Array<{
        query_string?: {
          query: string;
          analyzer: string;
          analyze_wildcard: boolean;
          auto_generate_phrase_queries: boolean;
          default_operator: string;
          fields: readonly string[];
          boost: number;
        };
        multi_match?: {
          query: string;
          type: "phrase_prefix" | "cross_fields" | "best_fields";
          boost?: number;
          minimum_should_match?: string;
          analyzer?: string;
          fields: readonly string[];
        };
      }>;
      must_not: Array<{
        match?: {
          prodgrpIndexName: {
            query: string;
          };
        };
        term?: {
          internal: boolean;
        };
      }>;
    };
  };
}

export const buildProductSearchQuery = (searchText: string): ElasticSearchQuery => {
  const validatedText = searchTextSchema.parse(searchText);
  const sanitizedQuery = sanitizeSearchValue(validatedText);

  return {
    size: 24,
    _source: PRODUCT_SOURCE_FIELDS,
    query: {
      bool: {
        minimum_should_match: 1,
        must: [
          {
            term: {
              isPublished: 1,
            },
          },
        ],
        should: [
          {
            query_string: {
              query: sanitizedQuery,
              analyzer: "my_analyzer",
              analyze_wildcard: true,
              auto_generate_phrase_queries: true,
              default_operator: "AND",
              fields: PRODUCT_SEARCH_FIELDS,
              boost: 200,
            },
          },
          {
            multi_match: {
              query: validatedText,
              type: "phrase_prefix",
              boost: 190,
              fields: PRODUCT_SEARCH_FIELDS,
            },
          },
          {
            multi_match: {
              query: validatedText,
              type: "cross_fields",
              minimum_should_match: "90%",
              analyzer: "my_analyzer",
              boost: 98,
              fields: CATEGORY_SEARCH_FIELDS,
            },
          },
          {
            multi_match: {
              query: validatedText,
              type: "best_fields",
              analyzer: "my_analyzer",
              fields: PRODUCT_SEARCH_FIELDS,
            },
          },
        ],
        must_not: [
          {
            match: {
              prodgrpIndexName: {
                query: "PrdGrp0*",
              },
            },
          },
          {
            term: {
              internal: true,
            },
          },
        ],
      },
    },
  };
};

// Legacy alias for backward compatibility
export const serchquery = buildProductSearchQuery;
