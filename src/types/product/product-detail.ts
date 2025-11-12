/**
 * Product Detail Types
 * 
 * TypeScript interfaces matching OpenSearch/Elasticsearch response structure
 * for product detail pages with comprehensive product information.
 */

export interface ProductAsset {
  type: string;
  height: string;
  width: string;
  source: string;
  isDefault: number | boolean;
}

export interface TaxRequirement {
  id: number;
  taxName: string;
  rate: number;
  default: boolean;
  compound: boolean;
  taxMapId: number;
}

export interface TaxGroup {
  id: number;
  taxGroupName: string;
  default: boolean;
  taxReqLs: TaxRequirement[];
  totalTax: number;
}

export interface HsnTaxBreakup {
  productId: number;
  id: number;
  hsnCode: string;
  description: string;
  tax: string;
  intraTax: TaxGroup;
  interTax: TaxGroup;
}

export interface ProductCategory {
  categoryId: number;
  categoryName: string;
  categorySlug?: string;
  categoryPath?: string;
  categoryLevel?: number;
  ancestorIds?: number[];
  isPrimary: boolean | number;
  isLeaf?: boolean;
  sortOrder?: number;
  parentId?: number;
  isActive?: boolean;
  categoryImage?: string;
  majorCategoryId?: number;
  majorCategoryName?: string;
  majorCategoryImage?: string;
  departmentId?: number;
  departmentName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
  subCategoryImage?: string;
}

export interface ProductSpecification {
  id?: number;
  name: string;
  value: string;
  unit?: string;
  displayOrder?: number;
}

export interface InventoryInfo {
  warehouseId?: number;
  warehouseName?: string;
  availableQuantity?: number;
  reservedQuantity?: number;
  inStock?: boolean;
}

export interface PriceListCode {
  priceListId: number;
  priceListName: string;
  priceListCode: string;
  price: number;
}

export interface CatalogCode {
  catalogId: number;
  catalogName: string;
  catalogCode: string;
}

export interface ProductAccessory {
  accessoryId: number;
  accessoryName: string;
  accessoryPrice: number;
  isDefault?: boolean;
  quantity?: number;
}

export interface ProductAttribute {
  attributeId: number;
  attributeName: string;
  attributeValue: string;
  attributeUnit?: string;
}

export interface ProductDetail {
  product_id: number;
  product_group_id: number;
  tenant_id: number;
  pg_name: string;
  pg_index_name: string;
  product_index_name: string;
  title: string;
  brand_id: number;
  brand_name: string;
  brands_name?: string;
  brand_product_id: string;
  product_short_description: string;
  product_description: string;
  unit_list_price: number;
  unit_mrp: number;
  accessory_price: number;
  product_cost: number;
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
  hsn_id: number;
  hsn_code: string;
  hsn_description: string;
  hsn_tax: number;
  hsn_tax_breakup: HsnTaxBreakup;
  is_published: number | boolean;
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
  published_on: string;
  version: number;
  set_product_atributes: ProductAttribute[];
  product_accessorieses: ProductAccessory[];
  product_assetss: ProductAsset[];
  product_specifications: ProductSpecification[];
  products_sub_categories: ProductCategory[];
  product_categories: ProductCategory[];
  inventory: InventoryInfo[];
  price_list_new_codes: PriceListCode[];
  catalog_code: CatalogCode[];
}

export interface ProductDetailResponse {
  success: boolean;
  data: ProductDetail | null;
  message?: string;
}

/**
 * OpenSearch API Response Structure
 * Based on the OpenSearch invocation response format
 */
export interface OpenSearchProductResponse {
  body: {
    found: boolean;
    _source: ProductDetail;
  };
}

/**
 * Product Display Data for UI components
 * Extracted subset of ProductDetail for display purposes
 */
export interface ProductDisplayData {
  // Legacy/raw fields (for backward compatibility)
  product_id?: number;
  brand_name?: string;
  product_short_description?: string;
  unit_list_price?: number;
  unit_mrp?: number;
  product_assetss?: ProductAsset[];
  product_specifications?: ProductSpecification[];

  // Normalized fields for UI usage
  productId: number;
  title: string;
  shortDescription: string;
  brandName: string;
  brandProductId: string;
  price: number;
  mrp: number;
  images: ProductAsset[];
  isAvailable: boolean;
  isNew: boolean;
  inStock: boolean;
  slug: string;
}

