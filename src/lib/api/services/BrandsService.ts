import { RequestContext } from "../client";
import { BaseService } from "./BaseService";
import SearchService from "./SearchService/SearchService";

export interface Brand {
  id: number;
  name: string;
  imgUrl?: string;
  brandImage?: string;
  brandsId?: number;
  companyId?: number;
  tenantId?: number;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
}

export interface BrandsResponse {
  status?: string;
  message?: string;
  data?: Brand[];
}

export class BrandsService extends BaseService<BrandsService> {
  // Note: This service uses SearchService for OpenSearch queries, not a direct client
  protected defaultClient = {} as any; // Not used, but required by BaseService

  /**
   * Generate a simple hash ID from brand name
   */
  private generateBrandId(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get all brands from OpenSearch
   * @param context - Request context with elasticCode and tenantCode
   * @returns List of all brands
   */
  async getAllBrands(context?: RequestContext): Promise<Brand[]> {
    try {
      // Get elasticCode from context to build elastic index
      const elasticCode = context?.elasticCode || "";
      const elasticIndex = elasticCode ? `${elasticCode}pgandproducts` : "sandboxpgandproducts";

      // Build OpenSearch aggregation query
      const query = {
        size: 0,
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
        aggs: {
          brands: {
            terms: {
              field: "brands_name.keyword",
              size: 10000,
            },
            aggs: {
              // Get brand ID
              brand_id: {
                terms: {
                  field: "brand_id",
                  size: 1,
                },
              },
              // Get a sample product to extract brandImage
              sample_product: {
                top_hits: {
                  size: 1,
                  _source: {
                    includes: ["brand_image", "brandImage", "brand_id"],
                  },
                },
              },
            },
          },
        },
      };

      // Fetch brands from OpenSearch
      const result = await SearchService.getAggregations(
        elasticIndex,
        query,
        context
      );

      if (!result.success || !result.aggregations.brands) {
        console.error("Failed to fetch brands from OpenSearch");
        return [];
      }

      // Transform aggregation buckets to Brand format
      const buckets = result.aggregations.brands.buckets || [];
      const brands: Brand[] = buckets.map((bucket: any) => {
        const brandName = bucket.key;
        const brandId = bucket.brand_id?.buckets?.[0]?.key || this.generateBrandId(brandName);

        // Try to get brand image from sample product
        let brandImage = "";
        if (bucket.sample_product?.hits?.hits?.[0]?._source) {
          const source = bucket.sample_product.hits.hits[0]._source;
          brandImage = source.brand_image || source.brandImage || "";
        }

        return {
          id: typeof brandId === "number" ? brandId : parseInt(String(brandId), 10),
          name: brandName,
          imgUrl: brandImage,
          brandImage: brandImage,
          brandsId: typeof brandId === "number" ? brandId : parseInt(String(brandId), 10),
        };
      });

      return brands;
    } catch (error) {
      console.error("Error fetching brands from OpenSearch:", error);
      return [];
    }
  }

  /**
   * Get brands by company ID
   * @param companyId - Company ID
   * @param context - Optional request context
   * @returns List of brands for the company
   */
  async getBrandsByCompanyId(
    companyId: number,
    context?: RequestContext
  ): Promise<Brand[]> {
    try {
      const result = context
        ? await this.callWith(
          `/brandses?find=ByCompanyId&companyId=${companyId}`,
          {},
          {
            context,
            method: "GET",
          }
        )
        : await this.call(
          `/brandses?find=ByCompanyId&companyId=${companyId}`,
          {},
          "GET"
        );

      const response = result as BrandsResponse;
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching brands by company:", error);
      throw error;
    }
  }
}

export default BrandsService.getInstance();

