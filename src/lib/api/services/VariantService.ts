import type { ProductDetail } from "@/types/product/product-detail";
import { extractOpenSearchHits } from "@/utils/opensearch/response-parser";
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

export class VariantService extends BaseService<VariantService> {
  protected defaultClient = openSearchClient;

  /**
   * Fetch all variants for a product group
   */
  async getVariantsByGroup(
    productGroupId: number,
    elasticIndex: string,
    context?: RequestContext
  ): Promise<VariantData[]> {
    try {
      // Fetching variants for group

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

      // Request body prepared for opensearch

      const options: { method: "POST"; context?: RequestContext } = {
        method: "POST",
      };
      if (context) options.context = context;

      const response = await this.callWith("", body, options);
      // OpenSearch response received

      const products = extractOpenSearchHits<ProductDetail>(response) || [];
      // Extracted products count

      const variantData = products.map(this.transformToVariantData);
      // Transformed variants count

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
   */
  groupVariantsByAttributes(variants: VariantData[]) {
    const groups: Record<
      string,
      Array<{ value: string; count: number; hexCode?: string }>
    > = {};

    variants.forEach(variant => {
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
        } else {
          const hexCode = this.getColorHexCode(value);
          groups[key].push({
            value,
            count: 1,
            ...(hexCode ? { hexCode } : {}),
          });
        }
      });
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
