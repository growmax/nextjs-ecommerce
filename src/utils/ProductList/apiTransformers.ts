import type {
  OpenSearchProductRequest,
  OpenSearchProductResponse,
  ProductListItem,
  RawProduct,
} from "@/types/product-listing";

/**
 * Map raw product data from API to display format
 * @param raw - Raw product data from catalog API
 * @returns Product formatted for UI display
 */
export function mapToProductItem(raw: RawProduct): ProductListItem {
  // Get primary image (isDefault = 1) or first image
  const primaryImage = raw.product_assetss?.find(
    (asset) => asset.type === "image" && asset.isDefault === 1
  );
  const image =
    primaryImage?.source ||
    raw.product_assetss?.find((asset) => asset.type === "image")?.source ||
    "";

  // Get all image URLs
  const images =
    raw.product_assetss
      ?.filter((asset) => asset.type === "image")
      .map((asset) => asset.source) || [];

  // Get primary category or first category
  const primaryCategory =
    raw.product_categories?.find((cat) => cat.isPrimary) ||
    raw.product_categories?.[0];

  // Determine stock status
  const inStock = !raw.is_discontinued && raw.is_published === 1;

  return {
    id: raw.product_id,
    sku: raw.brand_product_id,
    title: raw.product_short_description,
    brand: raw.brand_name,
    price: raw.unit_list_price, // Already in paise
    image,
    images,
    isNew: raw.is_new,
    inStock,
    category: primaryCategory?.categorySlug || "",
    subCategory: undefined as string | undefined, // Will be handled by real subcategory system later
    color: undefined as string | undefined, // Not available in current API response
  };
}

/**
 * Map API response to array of product items
 * @param response - Catalog API response
 * @returns Array of products for display
 */
export function mapProductsFromResponse(
  response: OpenSearchProductResponse
): ProductListItem[] {
  if (!response.body?.hits?.hits) {
    return [];
  }

  return response.body.hits.hits.map((hit) => mapToProductItem(hit._source));
}

/**
 * Create search query for a specific category
 * @param categoryId - Category identifier
 * @param options - Pagination options
 * @returns Search request object
 */
export function createCategorySearchQuery(
  categoryId: number,
  options?: {
    from?: number;
    size?: number;
  }
): OpenSearchProductRequest {
  return {
    Elasticindex: "schwingstetterpgandproducts",
    queryType: "search",
    ElasticType: "pgproduct",
    ElasticBody: {
      from: options?.from || 0,
      size: options?.size || 20, // Start with smaller size for testing
      query: {
        bool: {
          must: [
            {
              term: {
                is_published: 1,
              },
            },
            {
              nested: {
                path: "product_categories",
                query: {
                  term: {
                    "product_categories.categoryId": categoryId,
                  },
                },
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
    },
  };
}

/**
 * Create search query for all products (no category filter)
 * @param options - Pagination options
 * @returns Search request object
 */
export function createAllProductsSearchQuery(options?: {
  from?: number;
  size?: number;
}): OpenSearchProductRequest {
  return {
    Elasticindex: "schwingstetterpgandproducts",
    queryType: "search",
    ElasticType: "pgproduct",
    ElasticBody: {
      from: options?.from || 0,
      size: options?.size || 1000,
      query: {
        bool: {
          must: [
            {
              term: {
                is_published: 1,
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
    },
  };
}
