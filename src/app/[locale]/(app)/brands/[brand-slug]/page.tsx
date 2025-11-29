import { CategoryBreadcrumbServer } from "@/components/Breadcrumb/CategoryBreadcrumbServer";
import { ProductViewSwitcher } from "@/components/ProductGrid/ProductViewSwitcher";
import { StructuredDataServer } from "@/components/seo/StructuredDataServer";
import type { RequestContext } from "@/lib/api/client";
import SearchService, {
  ElasticSearchQuery,
  FormattedProduct,
} from "@/lib/api/services/SearchService/SearchService";
import TenantService from "@/lib/api/services/TenantService";
import BrandResolutionService from "@/lib/services/BrandResolutionService";
import type { FilterAggregations } from "@/types/category-filters";
import { buildBrandFilter, buildBrandQuery, getBaseQuery } from "@/utils/opensearch/browse-queries";
import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrandCategoryPageInteractivity } from "./[...categories]/_components/BrandCategoryPageInteractivity";

interface PageProps {
  params: Promise<{
    locale: string;
    "brand-slug": string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    in_stock?: string;
  }>;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, "brand-slug": brandSlug } = await params;

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
  const brand = await BrandResolutionService.getBrandBySlugDirect(
    brandSlug,
    context
  );

  if (!brand) {
    return {
      title: "Brand Not Found | E-Commerce",
    };
  }

  // Generate metadata
  const metadata = await BrandResolutionService.generateNextMetadata(
    brand,
    undefined, // No categoryPath
    locale,
    baseUrl
  );

  return metadata;
}

export async function generateStaticParams() {
  try {
    const brands = await BrandResolutionService.getAllBrands();

    return brands.slice(0, 100).map(brand => ({
      "brand-slug": brand.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export const revalidate = 1800;

export const dynamicParams = true;

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { locale, "brand-slug": brandSlug } = await params;
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
  const brand = await BrandResolutionService.getBrandBySlugDirect(
    brandSlug,
    context
  );

  if (!brand) {
    console.error(
      `[BrandPage] Brand not found for slug: "${brandSlug}" with elasticCode: "${elasticCode}"`
    );
    notFound();
  }

  // Fetch initial products server-side for SEO
  const page = parseInt(filters.page || "1", 10);
  const sortBy = parseInt(filters.sort || "1", 10);

  // Parse stock filter
  const inStock =
    filters.in_stock === "true"
      ? true
      : filters.in_stock === "false"
        ? false
        : undefined;

  const queryResult = buildBrandQuery(brand.name, {
    page,
    pageSize: 20,
    sortBy: { sortBy },
    ...(inStock !== undefined && { inStock }),
  });

  // Get elastic index from elasticCode
  const elasticIndex = elasticCode ? `${elasticCode}pgandproducts` : "";

  // Fetch products - will be streamed via Suspense
  const productsPromise = elasticIndex
    ? (async () => {
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

          return {
            products: result.data || [],
            total: result.total || 0,
          };
        } catch (error) {
          console.error(
            `[BrandPage] Error fetching products for brand "${brand.name}":`,
            error
          );
          return { products: [] as FormattedProduct[], total: 0 };
        }
      })()
    : Promise.resolve({ products: [] as FormattedProduct[], total: 0 });

  // Await products for total count (needed for pagination)
  const initialProducts = await productsPromise;

  // Build base query for aggregations (with brand filter)
  const baseQuery = getBaseQuery();
  const brandFilter = buildBrandFilter(brand.name);
  const baseQueryForAggs = {
    must: [...baseQuery.must, brandFilter],
    must_not: baseQuery.must_not,
  };

  // Fetch aggregations server-side for filters
  let aggregations: FilterAggregations | null = null;
  if (elasticIndex) {
    try {
      const aggregationResponse = await SearchService.getFilterAggregations(
        elasticIndex,
        baseQueryForAggs,
        undefined, // No current filters on brand landing page
        context
      );

      if (aggregationResponse.success) {
        aggregations = aggregationResponse.aggregations as FilterAggregations;
      }
    } catch (error) {
      console.error("Error fetching aggregations for brand page:", error);
      // Continue without aggregations - filters will show loading state
    }
  }

  // Get breadcrumbs
  const breadcrumbs = BrandResolutionService.getBrandBreadcrumbs(
    brand,
    undefined,
    locale
  );

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    description: `Shop ${brand.name} products`,
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

  console.log(initialProducts,"initialProducts")

  return (
    <>
      {/* Script to sync viewMode from localStorage before React hydrates */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const saved = localStorage.getItem('product-view-mode');
                if (saved === 'grid' || saved === 'list' || saved === 'table') {
                  window.__PRODUCT_VIEW_MODE__ = saved;
                } else {
                  window.__PRODUCT_VIEW_MODE__ = 'grid';
                }
              } catch (e) {
                window.__PRODUCT_VIEW_MODE__ = 'grid';
              }
            })();
          `,
        }}
      />
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
          </h1>
        </div>
      </div>

      {/* Interactivity Controls - Client component for pagination/sorting/filters */}
      <BrandCategoryPageInteractivity
        initialFilters={{
          page,
          sort: sortBy,
        }}
        total={initialProducts.total}
        aggregations={aggregations}
        brandName={brand.name}
        locale={locale}
        currentCategoryPath={[]}
      >
        {/* Product Grid - Server-rendered for SEO with Suspense for streaming */}
        <div className="relative">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[380px] bg-muted animate-pulse rounded-lg"
                  />
                ))}
              </div>
            }
          >
            <BrandProductGridWrapper
              productsPromise={productsPromise}
              brandName={brand.name}
              locale={locale}
            />
          </Suspense>
        </div>
      </BrandCategoryPageInteractivity>
    </>
  );
}

/**
 * Brand Product Grid Wrapper Component
 * Handles async product fetching with proper error handling
 */
async function BrandProductGridWrapper({
  productsPromise,
  brandName,
  locale,
}: {
  productsPromise: Promise<{ products: FormattedProduct[]; total: number }>;
  brandName: string;
  locale: string;
}) {
  const { products } = await productsPromise;

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No {brandName} products found.</p>
      </div>
    );
  }

  return <ProductViewSwitcher products={products} locale={locale} />;
}
