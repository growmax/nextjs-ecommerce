// Mock data for Query Builder testing

export const mockSearchTerm = "laptop";

export const mockElasticIndex = "products";

export const mockProductSearchOptions = {
  size: 10,
  from: 5,
};

export const mockProductSourceFields = [
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
];

export const mockProductSearchFields = [
  "productShortDescription",
  "brandsName",
  "productsSubCategories.subCategoryName",
  "productIndexName",
  "keywords",
];

export const mockExpectedQueryBody = {
  size: 24,
  from: 0,
  _source: mockProductSourceFields,
  query: {
    bool: {
      must: [
        {
          term: {
            isPublished: 1,
          },
        },
        {
          multi_match: {
            query: "laptop",
            fields: mockProductSearchFields,
            type: "best_fields",
          },
        },
      ],
    },
  },
};

export const mockExpectedSearchRequest = {
  Elasticindex: "products",
  queryType: "search",
  ElasticType: "pgproduct",
  ElasticBody: mockExpectedQueryBody,
};
