/**
 * Product Group Types
 *
 * TypeScript interfaces matching OpenSearch/Elasticsearch response structure
 * for Product Group documents containing variant attribute definitions.
 */

/**
 * ElasticVariantAttributes - Defines variant attribute structure from Product Group
 * This matches the OpenSearch structure where Product Groups define available variant options
 */
export interface ElasticVariantAttributes {
  name: string;
  displayType: string; // "color", "text", "image", etc.
  options: string[]; // All available options for this attribute
}

/**
 * ProductGroup - Product Group document structure from OpenSearch
 * Contains variant attribute definitions that apply to all products in the group
 */
export interface ProductGroup {
  product_group_id: number;
  pg_index_name: string;
  pg_name: string;
  variantAttributeses?: ElasticVariantAttributes[]; // Note: matches OpenSearch field name (plural with 'es')
  tenant_id?: number;
  brand_id?: number;
  brand_name?: string;
  created_by?: string;
  updated_by?: string;
  created_on?: string;
  updated_on?: string;
  version?: number;
}

/**
 * ProductGroupResponse - Response structure for Product Group fetch operations
 */
export interface ProductGroupResponse {
  success: boolean;
  data: ProductGroup | null;
  message?: string;
}
