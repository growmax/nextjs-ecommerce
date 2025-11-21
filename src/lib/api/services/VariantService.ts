import type { ProductDetail } from "@/types/product/product-detail";
import type { ProductGroup, ElasticVariantAttributes } from "@/types/product/product-group";
import { extractOpenSearchHits, extractOpenSearchData } from "@/utils/opensearch/response-parser";
import { openSearchClient, RequestContext } from "../client";
import { BaseService } from "./BaseService";

export interface VariantData {
  product_id: number;
  product_group_id: number;
  attributes: {
    color?: string;
    size?: string;
    [key: string]: string;
  };
  images: Array<{
    type: string;
    height: string;
    width: string;
    source: string;
    isDefault: number | boolean;
  }>;
  pricing: {
    unit_list_price: number;
    unit_mrp: number;
  };
  inventory: Array<{
    warehouseId?: number;
    warehouseName?: string;
    availableQuantity?: number;
    reservedQuantity?: number;
    inStock?: boolean;
  }>;
  availability: boolean;
  title: string;
  brand_name: string;
  product_short_description: string;
  brand_product_id: string;
}

export interface VariantSelection {
  color?: string;
  size?: string;
  [key: string]: string | undefined;
}

/**
 * VariantGroupData - Complete variant data including Product Group structure
 */
export interface VariantGroupData {
  variantAttributes: ElasticVariantAttributes[];
  variants: VariantData[];
  productGroup: ProductGroup | null;
}

export class VariantService extends BaseService<VariantService> {
  protected defaultClient = openSearchClient;

  /**
   * Fetch Product Group document by ID
   * Product Group contains variantAttributeses which define the variant structure
   * 
   * @param productGroupId - Product Group ID number
   * @param elasticIndex - OpenSearch index name
   * @param pgIndexName - Optional: Product Group index name from product data (most reliable)
   * @param context - Optional request context
   */
  async getProductGroup(
    productGroupId: number,
    elasticIndex: string,
    pgIndexName?: string,
    context?: RequestContext
  ): Promise<ProductGroup | null> {
    try {
      // Use provided pgIndexName if available, otherwise construct it
      // Backend format: PrdGrp{ProductGroupId} with 9 digits (e.g., PrdGrp000054518)
      // Matches backend code: PadLeft(strconv.Itoa(int(elasticPG.ProductGroupId)), 9)
      const indexName = pgIndexName || `PrdGrp${String(productGroupId).padStart(9, "0")}`;
      
      console.log("Fetching Product Group:", indexName, "from index:", elasticIndex);

      const body = {
        Elasticindex: elasticIndex,
        ElasticBody: indexName,
        ElasticType: "pgproduct",
        queryType: "get",
      };

      const options: { method: "POST"; context?: RequestContext } = {
        method: "POST",
      };
      if (context) options.context = context;

      const response = await this.callWith("", body, options);
      console.log("Product Group response:", response);

      const productGroup = extractOpenSearchData<ProductGroup>(response);
      console.log("Extracted Product Group:", productGroup);

      return productGroup;
    } catch (error) {
      // Check if it's a 404 (document not found) - this is expected for some product groups
      // The error might be wrapped in ApiClientError or contain OpenSearch response structure
      const errorObj = error as {
        status?: number;
        response?: { status?: number; data?: { error?: { meta?: { body?: { found?: boolean; statusCode?: number } } } } };
        data?: { error?: { meta?: { body?: { found?: boolean; statusCode?: number } } } };
      };
      
      const isNotFound = 
        errorObj.status === 404 ||
        errorObj.response?.status === 404 ||
        errorObj.response?.data?.error?.meta?.body?.found === false ||
        (errorObj.response?.data?.error?.meta?.body?.statusCode !== undefined && errorObj.response.data.error.meta.body.statusCode === 404) ||
        errorObj.data?.error?.meta?.body?.found === false ||
        (errorObj.data?.error?.meta?.body?.statusCode !== undefined && errorObj.data.error.meta.body.statusCode === 404);
      
      if (isNotFound) {
        console.log("Product Group not found (404) - will use fallback variant grouping from products");
      } else {
        console.warn("Error fetching Product Group (may not exist):", error);
      }
      // Return null if Product Group not found - this is acceptable for fallback
      return null;
    }
  }

  /**
   * Fetch all variants for a product group
   * Returns both Product Group structure and variant products
   */
  async getVariantsByGroup(
    productGroupId: number,
    elasticIndex: string,
    context?: RequestContext
  ): Promise<VariantData[]> {
    try {
      console.log(
        "Fetching variants for group:",
        productGroupId,
        "index:",
        elasticIndex
      );

      const body = {
        Elasticindex: elasticIndex,
        ElasticBody: {
          query: {
            bool: {
              must: [
                {
                  terms: {
                    product_group_id: [productGroupId],
                  },
                },
                {
                  term: {
                    is_published: 1,
                  },
                },
              ],
            },
          },
          size: 1000, // Maximum variants to fetch
        },
        ElasticType: "pgproduct",
        queryType: "search",
      };

      console.log("Request body:", body);

      const options: { method: "POST"; context?: RequestContext } = {
        method: "POST",
      };
      if (context) options.context = context;

      const response = await this.callWith("", body, options);
      console.log("OpenSearch response:", response);

      const products = extractOpenSearchHits<ProductDetail>(response) || [];
      console.log("Extracted products:", products.length);

      const variantData = products.map(this.transformToVariantData);
      console.log("Transformed variants:", variantData.length);

      return variantData;
    } catch (error) {
      console.error("Error in getVariantsByGroup:", error);
      throw error;
    }
  }

  /**
   * Transform ProductDetail to VariantData
   */
  private transformToVariantData(product: ProductDetail): VariantData {
    // Parse attributes into key-value pairs
    const attributes: Record<string, string> = {};
    if (product.set_product_atributes) {
      product.set_product_atributes.forEach(attr => {
        const key = attr.attributeName.toLowerCase().replace(/\s+/g, "_");
        attributes[key] = attr.attributeValue;
      });
    }

    // Determine availability from inventory
    const hasInventory = product.inventory && product.inventory.length > 0;
    const availability = hasInventory
      ? product.inventory.some(inv => inv.inStock)
      : true; // Default to true if no inventory data

    return {
      product_id: product.product_id,
      product_group_id: product.product_group_id,
      attributes: Object.fromEntries(
        Object.entries({
          color: attributes.color,
          size: attributes.size,
          ...attributes,
        }).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      ) as { color?: string; size?: string; [key: string]: string },
      images: product.product_assetss || [],
      pricing: {
        unit_list_price: product.unit_list_price,
        unit_mrp: product.unit_mrp,
      },
      inventory: product.inventory || [],
      availability,
      title: product.title || product.product_short_description,
      brand_name: product.brand_name,
      product_short_description: product.product_short_description,
      brand_product_id: product.brand_product_id,
    };
  }

  /**
   * Find specific variant by attribute selection
   */
  findVariantByAttributes(
    variants: VariantData[],
    selection: VariantSelection
  ): VariantData | null {
    return (
      variants.find(variant => {
        return Object.entries(selection).every(([key, value]) => {
          if (!value) return true; // Skip undefined values
          return (
            variant.attributes[
              key.toLowerCase().replace(/\s+/g, "_")
            ]?.toLowerCase() === value.toLowerCase()
          );
        });
      }) || null
    );
  }

  /**
   * Group variants by attribute type
   * Fallback method when Product Group data is not available
   */
  groupVariantsByAttributes(variants: VariantData[]) {
    const groups: Record<
      string,
      Array<{ value: string; count: number; hexCode?: string; available: boolean }>
    > = {};

    console.log("Grouping variants by attributes. Total variants:", variants.length);
    
    variants.forEach(variant => {
      const attributeCount = Object.keys(variant.attributes).length;
      if (attributeCount === 0) {
        console.log(`Variant ${variant.product_id} has no attributes`);
      }
      
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!value) return;

        if (!groups[key]) {
          groups[key] = [];
        }

        const existing = groups[key].find(
          item => item.value.toLowerCase() === value.toLowerCase()
        );
        if (existing) {
          existing.count++;
          // Update availability if this variant is available
          if (variant.availability) {
            existing.available = true;
          }
        } else {
          const hexCode = this.getColorHexCode(value);
          groups[key].push({
            value,
            count: 1,
            ...(hexCode ? { hexCode } : {}),
            available: variant.availability,
          });
        }
      });
    });

    console.log("Variant groups created:", Object.keys(groups).length, "attribute types");
    Object.entries(groups).forEach(([key, values]) => {
      console.log(`  ${key}: ${values.length} options`);
    });

    return groups;
  }

  /**
   * Get hex code for color names
   */
  private getColorHexCode(colorName: string): string | undefined {
    const colorMap: Record<string, string> = {
      red: "#EF4444",
      blue: "#3B82F6",
      green: "#10B981",
      yellow: "#F59E0B",
      purple: "#A855F7",
      pink: "#EC4899",
      orange: "#F97316",
      black: "#000000",
      white: "#FFFFFF",
      gray: "#6B7280",
      grey: "#6B7280",
      brown: "#92400E",
      navy: "#1E3A8A",
      teal: "#14B8A6",
      cyan: "#06B6D4",
      lime: "#84CC16",
      indigo: "#6366F1",
    };

    return colorMap[colorName.toLowerCase()];
  }

  /**
   * Fetch Product Group and all variants together
   * Returns complete variant data including Product Group structure
   * 
   * @param productGroupId - Product Group ID number
   * @param elasticIndex - OpenSearch index name
   * @param pgIndexName - Optional: Product Group index name from product data
   * @param context - Optional request context
   */
  async getVariantsWithGroup(
    productGroupId: number,
    elasticIndex: string,
    pgIndexName?: string,
    context?: RequestContext
  ): Promise<VariantGroupData> {
    try {
      // First fetch Product Group to get variantAttributeses
      const productGroup = await this.getProductGroup(
        productGroupId,
        elasticIndex,
        pgIndexName,
        context
      );

      // Then fetch all products in the group
      const variants = await this.getVariantsByGroup(
        productGroupId,
        elasticIndex,
        context
      );

      return {
        variantAttributes: productGroup?.variantAttributeses || [],
        variants,
        productGroup,
      };
    } catch (error) {
      console.error("Error in getVariantsWithGroup:", error);
      // Return empty structure on error
      return {
        variantAttributes: [],
        variants: [],
        productGroup: null,
      };
    }
  }

  /**
   * Group variants by Product Group attributes structure
   * Uses variantAttributeses from Product Group to structure the UI
   */
  groupVariantsByProductGroupAttributes(
    variantAttributes: ElasticVariantAttributes[],
    variants: VariantData[]
  ): Record<string, Array<{ value: string; count: number; hexCode?: string; available: boolean }>> {
    const groups: Record<
      string,
      Array<{ value: string; count: number; hexCode?: string; available: boolean }>
    > = {};

    // Use Product Group structure as the base
    variantAttributes.forEach(attr => {
      const attrKey = attr.name.toLowerCase().replace(/\s+/g, "_");
      groups[attrKey] = [];

      // For each option defined in Product Group
      attr.options.forEach(option => {
        // Check if any variant has this attribute value
        const matchingVariants = variants.filter(variant => {
          const variantAttrValue = variant.attributes[attrKey];
          return variantAttrValue && 
                 variantAttrValue.toLowerCase() === option.toLowerCase();
        });

        const available = matchingVariants.length > 0 && 
                         matchingVariants.some(v => v.availability);

        const hexCode = attr.displayType === "color" ? this.getColorHexCode(option) : undefined;
        const groupArray = groups[attrKey];
        if (groupArray) {
          groupArray.push({
            value: option,
            count: matchingVariants.length,
            ...(hexCode ? { hexCode } : {}),
            available,
          });
        }
      });
    });

    return groups;
  }

  /**
   * Server-side cacheable version
   */
  async getVariantsByGroupCached(
    productGroupId: number,
    elasticIndex: string,
    context?: RequestContext
  ): Promise<VariantData[]> {
    // This would integrate with your caching strategy
    return this.getVariantsByGroup(productGroupId, elasticIndex, context);
  }
}

export const variantServiceInstance = new VariantService();
export default variantServiceInstance;
