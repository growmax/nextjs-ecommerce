// Mock data for Query Builder testing

export const mockSearchTerm = "laptop";

export const mockElasticIndex = "products";

export const mockProductSearchOptions = {
  size: 10,
  from: 5,
};

export const mockProductSourceFields = [
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
];

export const mockProductSearchFields = [
  "product_short_description",
  "brands_name",
  "products_sub_categories.subCategoryName",
  "product_index_name",
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
            is_published: 1,
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
