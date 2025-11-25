/**
 * Fields to search in for product search
 */
const PRODUCT_SEARCH_FIELDS = [
  "product_short_description",
  "brands_name",
  "products_sub_categories.subCategoryName",
  "product_index_name",
  "keywords",
] as const;

/**
 * Fields to return in search results
 */
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
] as const;

export { PRODUCT_SEARCH_FIELDS, PRODUCT_SOURCE_FIELDS };
