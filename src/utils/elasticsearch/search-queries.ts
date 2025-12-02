import { z } from "zod";

const searchTextSchema = z.string().min(1, "Search text cannot be empty");

const PRODUCT_SEARCH_FIELDS = [
  "name",
  "keywords^8",
  "brand_product_id^5",
  "product_short_description^9",
  "description",
  "pg_name",
  "variantAttributeses.name",
  "productSeries",
  "brands_name",
  "variantAttributeses.options",
  "productSpecifications.key",
  "productSpecifications.value",
  "productGroupSpecifications.key",
  "productGroupSpecifications.value",
  "products_sub_categories.categoryName",
  "products_sub_categories.subCategoryName",
  "products_sub_categories.majorCategoryName",
  "ean",
] as const;

const PRODUCT_SOURCE_FIELDS = [
  "brand_product_id",
  "product_short_description",
  "product_assetss",
  "brands_name",
  "products_sub_categories.subCategoryName",
  "product_id",
  "product_index_name",
  "ean",
  "keywords",
  "b2c_unit_list_price",
  "b2c_discount_price",
] as const;

const CATEGORY_SEARCH_FIELDS = [
  "brands_name",
  "products_sub_categories.categoryName",
  "products_sub_categories.subCategoryName",
  "products_sub_categories.majorCategoryName",
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
          is_published: number;
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
          pg_index_name: {
            query: string;
          };
        };
        term?: {
          is_internal: boolean;
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
              is_published: 1,
            },
          },
        ],
        should: [
          {
            query_string: {
              query: sanitizedQuery,
              analyzer: "my_analyzer",
              analyze_wildcard: true,
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
              pg_index_name: {
                query: "PrdGrp0*",
              },
            },
          },
          {
            term: {
              is_internal: true,
            },
          },
        ],
      },
    },
  };
};

// Legacy alias for backward compatibility
export const serchquery = buildProductSearchQuery;
