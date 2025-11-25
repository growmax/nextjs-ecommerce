import { CategoryBreadcrumbServer } from "@/components/Breadcrumb/CategoryBreadcrumbServer";
import { ProductGridServer } from "@/components/ProductGrid/ProductGridServer";
import { StructuredDataServer } from "@/components/seo/StructuredDataServer";
import type { RequestContext } from "@/lib/api/client";
import SearchService, { ElasticSearchQuery, FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import TenantService from "@/lib/api/services/TenantService";
import BrandResolutionService from "@/lib/services/BrandResolutionService";
import CategoryResolutionService from "@/lib/services/CategoryResolutionService";
import { buildBrandQuery, buildCategoryBrandQuery } from "@/utils/opensearch/browse-queries";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandCategoryPageInteractivity } from "./_components/BrandCategoryPageInteractivity";

interface PageProps {
  params: Promise<{
    locale: string;
    "brand-slug": string;
    categories?: string[];
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, "brand-slug": brandSlug, categories = [] } = await params;

  // Get tenant data from API (cached, same as LayoutDataLoader)
  const headersList = await headers();
  const tenantDomain = headersList.get("x-tenant-domain") || "";
  const tenantOrigin = headersList.get("x-tenant-origin") || "";
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;
  
  // Fetch tenant data to get elasticCode (uses cache, so it's fast)
  let elasticCode = "";
  let tenantCode = "";
  if (tenantDomain && tenantOrigin) {
    try {
      const tenantData = await TenantService.getTenantDataCached(
        tenantDomain,
        tenantOrigin
      );
      elasticCode = tenantData?.data?.tenant?.elasticCode || "";
      tenantCode = tenantData?.data?.tenant?.tenantCode || "";
    } catch (error) {
      console.error("Error fetching tenant data in generateMetadata:", error);
    }
  }

  // If no elasticCode, cannot resolve brand - return not found
  if (!elasticCode) {
    return {
      title: "Brand Not Found | E-Commerce",
    };
  }

  // Build RequestContext for service calls
  const context: RequestContext = {
    elasticCode,
    tenantCode,
    ...(tenantOrigin && { origin: tenantOrigin }),
  };

  // Resolve brand with proper RequestContext using direct OpenSearch query
  const brand = await BrandResolutionService.getBrandBySlugDirect(brandSlug, context);

  if (!brand) {
    return {
      title: "Brand Not Found | E-Commerce",
    };
  }

  // Generate metadata
  const metadata = await BrandResolutionService.generateNextMetadata(
    brand,
    categories.length > 0 ? categories : undefined,
    locale,
    baseUrl
  );

  return metadata;
}

/**
 * Pre-generate static params for popular brand+category combinations
 */
export async function generateStaticParams() {
  try {
    // Note: generateStaticParams runs at build time, so we may not have tenant context
    // This will return empty array if no tenant code is available
    // In production, you may want to pre-generate for specific tenants
    const brands = await BrandResolutionService.getAllBrands();
    const categoryTree = await CategoryResolutionService.getCategoryTree();

    const params: {
      "brand-slug": string;
      categories?: string[];
    }[] = [];

    // Add brand + top-level category combinations
    brands.slice(0, 50).forEach((brand) => {
      categoryTree.slice(0, 5).forEach((majorCategory) => {
        params.push({
          "brand-slug": brand.slug,
          categories: [majorCategory.slug],
        });
      });
    });

    // Limit to top 500 for build performance
    return params.slice(0, 500);
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Enable ISR - revalidate every 30 minutes
export const revalidate = 1800;

// Allow dynamic params for brand+category combinations not pre-generated
export const dynamicParams = true;

/**
 * Brand Category Page - Server Component
 * Handles SEO, initial data fetching, and metadata generation
 */
export default async function BrandCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, "brand-slug": brandSlug, categories = [] } = await params;
  const filters = await searchParams;

  // Get tenant data from API (cached, same as LayoutDataLoader)
  const headersList = await headers();
  const tenantDomain = headersList.get("x-tenant-domain") || "";
  const tenantOrigin = headersList.get("x-tenant-origin") || "";
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;
  
  // Fetch tenant data to get elasticCode (uses cache, so it's fast)
  let elasticCode = "";
  let tenantCode = "";
  if (tenantDomain && tenantOrigin) {
    try {
      const tenantData = await TenantService.getTenantDataCached(
        tenantDomain,
        tenantOrigin
      );
      elasticCode = tenantData?.data?.tenant?.elasticCode || "";
      tenantCode = tenantData?.data?.tenant?.tenantCode || "";
    } catch (error) {
      console.error("Error fetching tenant data:", error);
    }
  }

  // If no elasticCode, cannot resolve brand - return 404
  if (!elasticCode) {
    notFound();
  }

  // Build RequestContext for service calls
  const context: RequestContext = {
    elasticCode,
    tenantCode,
    ...(tenantOrigin && { origin: tenantOrigin }),
  };

  // Resolve brand with proper RequestContext using direct OpenSearch query
  const brand = await BrandResolutionService.getBrandBySlugDirect(brandSlug, context);

  if (!brand) {
    console.error(`[BrandCategoryPage] Brand not found for slug: "${brandSlug}" with elasticCode: "${elasticCode}"`);
    notFound();
  }


  // Resolve category path if provided with proper RequestContext
  const categoryPath =
    categories.length > 0
      ? await CategoryResolutionService.resolveCategories(categories, context)
      : null;

  // Fetch initial products server-side for SEO
  const page = parseInt(filters.page || "1", 10);
  const sortBy = parseInt(filters.sort || "1", 10);

  let queryResult;

  if (categoryPath && categoryPath.ids.categoryIds.length > 0) {
    // Build query with both brand and category filters
    queryResult = buildCategoryBrandQuery(
      categoryPath.ids.categoryIds,
      brand.name,
      {
        page,
        pageSize: 20,
        sortBy: { sortBy },
      }
    );
  } else {
    // Build brand-only query
    queryResult = buildBrandQuery(brand.name, {
      page,
      pageSize: 20,
      sortBy: { sortBy },
    });
  }

  // Get elastic index from elasticCode
  const elasticIndex = elasticCode ? `${elasticCode}pgandproducts` : "";

  let initialProducts: { products: FormattedProduct[]; total: number } = { 
    products: [] as FormattedProduct[], 
    total: 0 
  };

  if (elasticIndex) {
    try {
      // Build query object ensuring sort is properly typed
      const searchQuery: ElasticSearchQuery = {
        query: queryResult.query.query,
        size: queryResult.query.size,
        from: queryResult.query.from,
        _source: queryResult.query._source,
        ...(queryResult.query.sort && { sort: queryResult.query.sort }),
      };

      const result = await SearchService.searchProducts({
        elasticIndex,
        query: searchQuery,
      });

      initialProducts = {
        products: result.data || [],
        total: result.total || 0,
      };

    } catch (error) {
      console.error(`[BrandCategoryPage] Error fetching products for brand "${brand.name}":`, error);
      // Continue with empty products - client will handle retry
    }
  }

  // Get breadcrumbs
  const breadcrumbs = BrandResolutionService.getBrandBreadcrumbs(
    brand,
    categories.length > 0 ? categories : undefined,
    locale
  );

  const categoryName = categoryPath && categoryPath.nodes.length > 0
    ? categoryPath.nodes[categoryPath.nodes.length - 1]?.name || null
    : null;

  // Build category URL for "View all brands" link
  const categoryUrl = categoryPath
    ? `/${locale}/${categoryPath.slugs.join("/")}`
    : null;

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    description: categoryName
      ? `Shop ${brand.name} ${categoryName} products`
      : `Shop ${brand.name} products`,
    ...(brand.logoUrl && { logo: brand.logoUrl }),
    ...(brand.website && { url: brand.website }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: `${baseUrl}${crumb.href}`,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Structured Data for SEO - Server-rendered */}
      <StructuredDataServer data={structuredData} />

      {/* Breadcrumbs - Server-rendered */}
      <CategoryBreadcrumbServer breadcrumbs={breadcrumbs} />

      {/* Brand Header - Server-rendered */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          {brand.logoUrl && (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-12 w-auto object-contain"
            />
          )}
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {brand.name}
            {categoryName && ` ${categoryName}`}
          </h1>
        </div>
        {categoryPath && categoryPath.nodes.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {categoryPath.fullPath}
          </p>
        )}
        {categoryUrl && (
          <Link
            href={categoryUrl}
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            View all brands in this category →
          </Link>
        )}
      </div>

      {/* Interactivity Controls - Client component for pagination/sorting */}
      <BrandCategoryPageInteractivity
        initialFilters={{
          page,
          sort: sortBy,
        }}
        total={initialProducts.total}
      />

      {/* Product Grid - Server-rendered for SEO */}
      <div className="relative">
        {initialProducts.products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No {brand.name} products found
              {categoryName ? ` in ${categoryName}` : ""}.
            </p>
          </div>
        ) : (
          <ProductGridServer products={initialProducts.products} locale={locale} />
        )}
      </div>
    </div>
  );
}

