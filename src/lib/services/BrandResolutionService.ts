import { RequestContext } from "@/lib/api/client";
import SearchService from "@/lib/api/services/SearchService/SearchService";
import { Metadata } from "next";

/**
 * Brand data structure
 */
export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive?: boolean;
}

export interface BrandMetadata {
  title: string;
  description: string;
  canonical: string;
  breadcrumbs: BreadcrumbItem[];
  structuredData: {
    "@context": string;
    "@type": string;
    name: string;
    description?: string;
    logo?: string;
    url?: string;
    breadcrumb?: {
      "@type": string;
      itemListElement: Array<{
        "@type": string;
        position: number;
        name: string;
        item: string;
      }>;
    };
  };
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Brand Resolution Service
 * Handles brand slug resolution and metadata generation
 */
class BrandResolutionService {
  private static instance: BrandResolutionService;

  private constructor() {}

  public static getInstance(): BrandResolutionService {
    if (!BrandResolutionService.instance) {
      BrandResolutionService.instance = new BrandResolutionService();
    }
    return BrandResolutionService.instance;
  }

  /**
   * Generate slug from brand name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

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
   * Convert slug to potential brand name patterns
   * Tries common capitalization patterns to match brand names in OpenSearch
   */
  private convertSlugToBrandPatterns(slug: string): string[] {
    // Convert slug back to potential brand name patterns
    // e.g., "milwaukee" -> ["Milwaukee", "MILWAUKEE", "milwaukee"]
    
    const patterns: string[] = [];
    
    // Pattern 1: Capitalize first letter of each word
    const capitalized = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    patterns.push(capitalized);
    
    // Pattern 2: All uppercase
    const uppercase = slug.replace(/-/g, " ").toUpperCase();
    if (uppercase !== capitalized.toUpperCase()) {
      patterns.push(uppercase);
    }
    
    // Pattern 3: All lowercase (for exact match)
    const lowercase = slug.replace(/-/g, " ");
    if (lowercase !== capitalized.toLowerCase()) {
      patterns.push(lowercase);
    }
    
    // Pattern 4: Prefix pattern (for keyword field prefix matching)
    // Use the capitalized version as prefix
    const firstWord = capitalized.split(" ")[0];
    if (firstWord) {
      patterns.push(firstWord); // First word as prefix
    }
    
    return patterns;
  }

  /**
   * Fetch all brands from OpenSearch using aggregation query
   */
  async getAllBrands(context?: RequestContext): Promise<Brand[]> {
    try {
      // Get tenant code from context to build elastic index
      const tenantCode = context?.tenantCode || "";
      if (!tenantCode) {
        console.warn("No tenant code provided for brand aggregation query");
        return [];
      }

      const elasticIndex = `${tenantCode}pgandproducts`;

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
      const brands: Brand[] = buckets.map((bucket) => {
        const brandName = bucket.key;
        return {
          id: this.generateBrandId(brandName),
          name: brandName,
          slug: this.generateSlug(brandName),
          isActive: true,
          // Note: description, logoUrl, website not available from aggregations
        };
      });

      return brands;
    } catch (error) {
      console.error("Error fetching brands from OpenSearch:", error);
      return [];
    }
  }

  /**
   * Get brand by slug using direct OpenSearch query
   * Optimized to query only the specific brand instead of fetching all brands
   */
  async getBrandBySlugDirect(
    slug: string,
    context?: RequestContext
  ): Promise<Brand | null> {
    try {
      // Get tenant code from context to build elastic index
      const tenantCode = context?.tenantCode || "";
      if (!tenantCode) {
        console.warn("No tenant code provided for brand resolution query");
        return null;
      }

      const elasticIndex = `${tenantCode}pgandproducts`;

      // Get potential brand name patterns from slug
      const patterns = this.convertSlugToBrandPatterns(slug);

      // Try each pattern until we find a match
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const isPrefixPattern = i === patterns.length - 1; // Last pattern is prefix
        
        let query: any;
        
        if (isPrefixPattern) {
          // Use prefix query for keyword field (last pattern)
          query = {
            size: 0,
            query: {
              bool: {
                must: [
                  {
                    term: {
                      is_published: 1,
                    },
                  },
                  {
                    prefix: {
                      "brands_name.keyword": pattern,
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
                  size: 10, // Only need first match
                },
              },
            },
          };
        } else {
          // Use exact term match for specific patterns
          query = {
            size: 0,
            query: {
              bool: {
                must: [
                  {
                    term: {
                      is_published: 1,
                    },
                  },
                  {
                    term: {
                      "brands_name.keyword": pattern,
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
                  size: 10, // Only need first match
                },
              },
            },
          };
        }

        // Query OpenSearch for brand aggregation
        const result = await SearchService.getAggregations(
          elasticIndex,
          query,
          context
        );


        if (result.success && result.aggregations.brands) {
          const buckets = result.aggregations.brands.buckets || [];
          
          // Check all buckets to find the best match
          for (const bucket of buckets) {
            if (!bucket || !bucket.key) continue;
            
            const brandName = bucket.key;
            const brand: Brand = {
              id: this.generateBrandId(brandName),
              name: brandName,
              slug: this.generateSlug(brandName),
              isActive: true,
            };
            
            
            // If exact slug match, return immediately (best match)
            if (brand.slug === slug) {
              return brand;
            }
          }
          
     
        }
      }

      // No match found after trying all patterns
      return null;
    } catch (error) {
      console.error("Error fetching brand by slug from OpenSearch:", error);
      return null;
    }
  }

  /**
   * Get brand by slug
   * @deprecated Use getBrandBySlugDirect() for better performance
   */
  async getBrandBySlug(
    slug: string,
    context?: RequestContext
  ): Promise<Brand | null> {
    const brands = await this.getAllBrands(context);
    return brands.find((brand) => brand.slug === slug) || null;
  }

  /**
   * Get brand by ID
   */
  async getBrandById(
    id: number,
    context?: RequestContext
  ): Promise<Brand | null> {
    const brands = await this.getAllBrands(context);
    return brands.find((brand) => brand.id === id) || null;
  }

  /**
   * Get breadcrumbs for brand page
   */
  getBrandBreadcrumbs(
    brand: Brand,
    categoryPath?: string[],
    locale: string = "en"
  ): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", href: `/${locale}` },
      { label: "Brands", href: `/${locale}/brands` },
      { label: brand.name, href: `/${locale}/brands/${brand.slug}` },
    ];

    // Add category path if provided
    if (categoryPath && categoryPath.length > 0) {
      let currentPath = `/${locale}/brands/${brand.slug}`;
      categoryPath.forEach((slug) => {
        currentPath += `/${slug}`;
        breadcrumbs.push({
          label: slug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          href: currentPath,
        });
      });
    }

    return breadcrumbs;
  }

  /**
   * Generate SEO metadata for brand page
   */
  async generateBrandMetadata(
    brand: Brand,
    categoryPath?: string[],
    locale: string = "en",
    baseUrl: string = ""
  ): Promise<BrandMetadata> {
    const categorySuffix =
      categoryPath && categoryPath.length > 0
        ? ` ${categoryPath
            .map((s) =>
              s
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
            )
            .join(" > ")}`
        : "";

    const title = `${brand.name}${categorySuffix} | Products`;
    const description = categoryPath
      ? `Shop ${brand.name} ${categoryPath
          .map((s) =>
            s
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          )
          .join(" ")} products. Find the best ${brand.name} products at competitive prices.`
      : `Shop ${brand.name} products. Find the best ${brand.name} products at competitive prices.`;

    const pathSegments = [`/${locale}/brands/${brand.slug}`];
    if (categoryPath && categoryPath.length > 0) {
      pathSegments.push(...categoryPath.map((s) => `/${s}`));
    }
    const canonical = `${baseUrl}${pathSegments.join("")}`;

    const breadcrumbs = this.getBrandBreadcrumbs(brand, categoryPath, locale);

    // Structured data for breadcrumbs
    const breadcrumbStructuredData = {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: `${baseUrl}${crumb.href}`,
      })),
    };

    // Brand structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Brand",
      name: brand.name,
      description: description,
      ...(brand.logoUrl && { logo: brand.logoUrl }),
      ...(brand.website && { url: brand.website }),
      breadcrumb: breadcrumbStructuredData,
    };

    return {
      title,
      description,
      canonical,
      breadcrumbs,
      structuredData,
    };
  }

  /**
   * Generate Next.js metadata object
   */
  async generateNextMetadata(
    brand: Brand,
    categoryPath?: string[],
    locale: string = "en",
    baseUrl: string = ""
  ): Promise<Metadata> {
    const metadata = await this.generateBrandMetadata(
      brand,
      categoryPath,
      locale,
      baseUrl
    );

    return {
      title: metadata.title,
      description: metadata.description,
      alternates: {
        canonical: metadata.canonical,
      },
      openGraph: {
        title: metadata.title,
        description: metadata.description,
        url: metadata.canonical,
        type: "website",
        ...(brand.logoUrl && { images: [{ url: brand.logoUrl }] }),
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

}

export default BrandResolutionService.getInstance();
