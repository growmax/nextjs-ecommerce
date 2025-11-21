/**
 * Fields to search in for product search
 */
const PRODUCT_SEARCH_FIELDS = [
  "productShortDescription",
  "brandsName",
  "productsSubCategories.subCategoryName",
  "productIndexName",
  "keywords",
] as const;

/**
 * Fields to return in search results
 */
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
] as const;

export { PRODUCT_SEARCH_FIELDS, PRODUCT_SOURCE_FIELDS };
