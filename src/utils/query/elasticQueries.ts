// Sanitize search text to prevent Elasticsearch query syntax issues
const sanitizeValue = (value: string): string => {
  if (!value) return "";
  // Escape special characters that could break Elasticsearch queries
  return value.replace(/[+\-=&|><!(){}[\]^"~*?:\\/]/g, "\\$&");
};

export const serchquery = (searchText: string) => {
  const fields = [
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
  ];
  const query = {
    size: 24,
    _source: [
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
    ],
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
              query: sanitizeValue(searchText),
              analyzer: "my_analyzer",
              analyze_wildcard: true,
              auto_generate_phrase_queries: true,
              default_operator: "AND",
              fields,
              boost: 200,
            },
          },
          {
            multi_match: {
              query: searchText,
              type: "phrase_prefix",
              boost: 190,
              fields,
            },
          },
          {
            multi_match: {
              query: searchText,
              type: "cross_fields",
              minimum_should_match: "90%",
              analyzer: "my_analyzer",
              boost: 98,
              fields: [
                "brandsName",
                "productsSubCategories.categoryName",
                "productsSubCategories.subCategoryName",
                "productsSubCategories.majorCategoryName",
              ],
            },
          },
          {
            multi_match: {
              query: searchText,
              type: "best_fields",
              analyzer: "my_analyzer",
              fields,
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
  return query;
};
