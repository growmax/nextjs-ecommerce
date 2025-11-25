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
   * Fetch all brands from OpenSearch using aggregation query
   */
  async getAllBrands(context?: RequestContext): Promise<Brand[]> {
    try {
      // Get elasticCode from context to build elastic index
      const elasticCode = context?.elasticCode || "";
      if (!elasticCode) {
        console.warn("No elasticCode provided for brand aggregation query");
        return [];
      }

      const elasticIndex = `${elasticCode}pgandproducts`;
      
      // Validate elasticIndex before making API call
      if (!elasticIndex || elasticIndex === "pgandproducts") {
        console.warn("Invalid elastic index for brand aggregation:", elasticIndex);
        return [];
      }

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
   * Uses case-insensitive match query on brandsName field
   * Since brand names are unique, we can use a simple match query instead of pattern matching
   */
  async getBrandBySlugDirect(
    slug: string,
    context?: RequestContext
  ): Promise<Brand | null> {
    try {
      // Normalize slug to lowercase for case-insensitive matching
      // Since generateSlug() always produces lowercase slugs, we need to normalize the input
      const normalizedSlug = slug.toLowerCase();
      
      // Get elasticCode from context to build elastic index
      const elasticCode = context?.elasticCode || "";
      if (!elasticCode) {
        console.warn("No elasticCode provided for brand resolution query");
        return null;
      }

      const elasticIndex = `${elasticCode}pgandproducts`;

      // Validate elasticIndex before making API call
      if (!elasticIndex || elasticIndex === "pgandproducts") {
        console.warn("Invalid elastic index for brand lookup:", elasticIndex);
        return null;
      }

      const brandNamePattern = normalizedSlug.replace(/-/g, " ");

      // The analyzed field uses the analyzer which handles case-insensitivity
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
              {
                match: {
                  brands_name: brandNamePattern, // Case-insensitive match using analyzer
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
              size: 1, // Only need first match since brand names are unique
            },
          },
        },
      };

      // Query OpenSearch for brand aggregation
      const result = await SearchService.getAggregations(
        elasticIndex,
        query,
        context
      );

      if (result.success && result.aggregations.brands) {
        const buckets = result.aggregations.brands.buckets || [];
        
        // Since brand names are unique, take the first match
        if (buckets.length > 0 && buckets[0]?.key) {
          const brandName = buckets[0].key;
          const brand: Brand = {
            id: this.generateBrandId(brandName),
            name: brandName,
            slug: this.generateSlug(brandName),
            isActive: true,
          };
          
          // Validate slug matches as a safety check (both are lowercase now)
          if (brand.slug === normalizedSlug) {
            return brand;
          }
        }
      }

      // No match found
      return null;
    } catch (error) {
      console.error("Error fetching brand by slug from OpenSearch:", error);
      return null;
    }
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
