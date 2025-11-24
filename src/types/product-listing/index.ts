/**
 * Product Listing Type Definitions
 * Optimized for display in product listing pages
 */

// Display-optimized product type
export interface ProductListItem {
  id: number;
  sku: string;
  title: string;
  brand: string;
  price: number; // In cents (14999 = $149.99)
  image: string; // Primary image URL
  images?: string[]; // All image URLs
  isNew: boolean; // Show "New" badge
  inStock: boolean; // In stock status
  category: string; // Main category ID
  subCategory?: string | undefined; // Sub-category ID
  color?: string | undefined; // Product color
}

// Category type
export interface Category {
  id: string;
  label: string;
}

// Sub-category type
export interface SubCategory {
  id: string;
  label: string;
  parentId: string; // Parent category ID
}

// Brand type
export interface Brand {
  id: string;
  label: string;
}

// Color filter option
export interface ColorOption {
  id: string;
  label: string;
  color: string; // Tailwind class like "bg-red-500"
}

// View mode type
export type ViewMode = "grid" | "list";

// Sort options
export type SortOption =
  | "best-match"
  | "price-low-high"
  | "price-high-low"
  | "newest";

// ============================================================================
// OpenSearch API Types
// ============================================================================

/**
 * OpenSearch product search request
 */
export interface OpenSearchProductRequest {
  Elasticindex: string;
  queryType: "search";
  ElasticType: "pgproduct";
  ElasticBody: ElasticSearchBody;
}

/**
 * Elasticsearch query body
 */
export interface ElasticSearchBody {
  from: number;
  size: number;
  query: {
    bool: {
      must: ElasticQuery[];
      must_not?: ElasticQuery[];
    };
  };
}

/**
 * Elasticsearch query types
 */
export type ElasticQuery =
  | { term: Record<string, any> }
  | { nested: { path: string; query: any } }
  | { match: Record<string, any> };

/**
 * OpenSearch API response
 */
export interface OpenSearchProductResponse {
  body: {
    took: number;
    timed_out: boolean;
    _shards: {
      total: number;
      successful: number;
      skipped: number;
      failed: number;
    };
    hits: {
      total: {
        value: number;
        relation: string;
      };
      max_score: number;
      hits: Array<{
        _index: string;
        _id: string;
        _score: number;
        _source: RawProduct;
      }>;
    };
  };
  statusCode: number;
  headers?: Record<string, any>;
  meta?: any;
}

/**
 * Raw product data from OpenSearch API
 */
export interface RawProduct {
  product_id: number;
  product_group_id: number;
  tenant_id: number;
  pg_name: string;
  pg_index_name: string;
  product_series: string;
  brand_id: number;
  brand_name: string;
  hsn_id: number;
  hsn_code: string;
  hsn_description: string;
  hsn_tax: number;
  hsn_tax_breakup?: any;
  brand_product_id: string;
  product_short_description: string;
  product_index_name: string;
  unit_list_price: number;
  unit_mrp: number;
  accessory_price: number;
  b2c_unit_list_price: number;
  b2c_discount_price: number;
  unit_quantity: number;
  unit_of_measure: string;
  packaging_qty: number;
  outer_pack_qty: string;
  min_order_quantity: string;
  packaging_dimension: string;
  net_weight: string;
  standard_lead_time: string;
  lead_uom: string;
  primary_uom: string;
  secondary_uom: string;
  is_published: number;
  is_discontinued: boolean;
  is_new: boolean;
  is_brand_stock: boolean;
  is_internal: boolean;
  is_listprice_public: boolean;
  show_price: boolean;
  show_extended_id: boolean;
  is_b2c: boolean;
  is_tax_inclusive: boolean;
  is_replacement: boolean;
  is_custom_product: boolean;
  is_bundle: boolean;
  can_deselect_accessory: boolean;
  business_unit_id: number;
  business_unit_name: string;
  business_unit_code: string;
  division_id: number;
  division_name: string;
  division_code: string;
  created_by: string;
  updated_by: string;
  created_on: string;
  updated_on: string;
  version: number;
  published_on: string;
  set_product_atributes: any[];
  product_accessorieses: any[];
  product_assetss: ProductAsset[];
  product_specifications: Array<{ key: string; value: string }>;
  products_sub_categories: ProductSubCategory[];
  inventory: any[];
  price_list_new_codes: any[];
  catalog_code: any[];
  product_categories: ProductCategory[];
  brands_name: string;
}

/**
 * Product asset (image/video)
 */
export interface ProductAsset {
  type: string;
  height: string;
  width: string;
  source: string;
  isDefault: number;
}

/**
 * Product category from API
 */
export interface ProductCategory {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryPath: string;
  categoryLevel: number;
  ancestorIds: number[];
  isPrimary: boolean;
  isLeaf: boolean;
  sortOrder: number;
  fullPathNames: string;
  isActive: boolean;
}

/**
 * Product sub-category from API
 * Note: This is the real subcategory structure from API
 * Different from the mock/placeholder subcategories used in UI development
 */
export interface ProductSubCategory {
  subCategoryId: number;
  subCategoryName: string;
  subCategoryImage: string;
  categoryId: number;
  categoryName: string;
  categoryImage: string;
  majorCategoryId: number;
  majorCategoryName: string;
  majorCategoryImage: string;
  departmentId: number;
  departmentName: string;
  isPrimary: number;
}

/**
 * Product transformer function type
 */
export type ProductTransformer = (raw: RawProduct) => ProductListItem;
