import { CategoryBreadcrumbServer } from "@/components/Breadcrumb/CategoryBreadcrumbServer";
import { ProductViewSwitcher } from "@/components/ProductGrid/ProductViewSwitcher";
import { StructuredDataServer } from "@/components/seo/StructuredDataServer";
import { Link } from "@/i18n/navigation";
import type { RequestContext } from "@/lib/api/client";
import SearchService, {
  ElasticSearchQuery,
  FormattedProduct,
} from "@/lib/api/services/SearchService/SearchService";
import TenantService from "@/lib/api/services/TenantService";
import BrandResolutionService from "@/lib/services/BrandResolutionService";
import CategoryResolutionService from "@/lib/services/CategoryResolutionService";
import type { FilterAggregations } from "@/types/category-filters";
import {
  buildBrandFilter,
  buildBrandQuery,
  buildCategoryBrandQuery,
  buildCategoryFilter,
  getBaseQuery,
} from "@/utils/opensearch/browse-queries";
import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
    in_stock?: string;
    min_price?: string;
    max_price?: string;
    catalog_code?: string | string[];
    equipment_code?: string | string[];
    [key: string]: string | string[] | undefined; // For variant attributes and specs
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
    brands.slice(0, 50).forEach(brand => {
      categoryTree.slice(0, 5).forEach(majorCategory => {
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
  const brand = await BrandResolutionService.getBrandBySlugDirect(
    brandSlug,
    context
  );

  if (!brand) {
    console.error(
      `[BrandCategoryPage] Brand not found for slug: "${brandSlug}" with elasticCode: "${elasticCode}"`
    );
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

  // Parse filters from URL (same as categories page)
  const variantAttributes: Record<string, string[]> = {};
  const productSpecifications: Record<string, string[]> = {};
  const knownKeys = new Set(["page", "sort", "in_stock", "min_price", "max_price", "catalog_code", "equipment_code"]);

  Object.entries(filters).forEach(([key, value]) => {
    if (!knownKeys.has(key) && value) {
      if (key.startsWith("spec_")) {
        // Product specification
        const specKey = key.replace("spec_", "");
        const values = Array.isArray(value) ? value : [value];
        if (!productSpecifications[specKey]) {
          productSpecifications[specKey] = [];
        }
        productSpecifications[specKey].push(
          ...values.filter(v => v && typeof v === "string")
        );
      } else {
        // Variant attribute
        const values = Array.isArray(value) ? value : [value];
        if (!variantAttributes[key]) {
          variantAttributes[key] = [];
        }
        variantAttributes[key].push(
          ...values.filter(v => v && typeof v === "string")
        );
      }
    }
  });

  // Parse stock filter
  const inStock =
    filters.in_stock === "true"
      ? true
      : filters.in_stock === "false"
        ? false
        : undefined;

  // Parse price range filter
  const minPrice = filters.min_price ? parseFloat(filters.min_price as string) : undefined;
  const maxPrice = filters.max_price ? parseFloat(filters.max_price as string) : undefined;
  let priceRange: { min?: number; max?: number } | undefined = undefined;
  if (minPrice !== undefined || maxPrice !== undefined) {
    priceRange = {};
    if (minPrice !== undefined && !isNaN(minPrice)) {
      priceRange.min = minPrice;
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      priceRange.max = maxPrice;
    }
    // If no valid prices were parsed, set to undefined
    if (Object.keys(priceRange).length === 0) {
      priceRange = undefined;
    }
  }

  // Parse catalog codes
  const catalogCodes = filters.catalog_code
    ? (Array.isArray(filters.catalog_code)
        ? filters.catalog_code
        : [filters.catalog_code]).filter((v): v is string => typeof v === "string")
    : undefined;

  // Parse equipment codes
  const equipmentCodes = filters.equipment_code
    ? (Array.isArray(filters.equipment_code)
        ? filters.equipment_code
        : [filters.equipment_code]).filter((v): v is string => typeof v === "string")
    : undefined;

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
        ...(Object.keys(variantAttributes).length > 0 && { variantAttributes }),
        ...(Object.keys(productSpecifications).length > 0 && {
          productSpecifications,
        }),
        ...(inStock !== undefined && { inStock }),
        ...(priceRange && { priceRange }),
        ...(catalogCodes && catalogCodes.length > 0 && { catalogCodes }),
        ...(equipmentCodes && equipmentCodes.length > 0 && { equipmentCodes }),
      }
    );
  } else {
    // Build brand-only query
    queryResult = buildBrandQuery(brand.name, {
      page,
      pageSize: 20,
      sortBy: { sortBy },
      ...(Object.keys(variantAttributes).length > 0 && { variantAttributes }),
      ...(Object.keys(productSpecifications).length > 0 && {
        productSpecifications,
      }),
      ...(inStock !== undefined && { inStock }),
      ...(priceRange && { priceRange }),
      ...(catalogCodes && catalogCodes.length > 0 && { catalogCodes }),
      ...(equipmentCodes && equipmentCodes.length > 0 && { equipmentCodes }),
    });
  }

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
            `[BrandCategoryPage] Error fetching products for brand "${brand.name}":`,
            error
          );
          return { products: [] as FormattedProduct[], total: 0 };
        }
      })()
    : Promise.resolve({ products: [] as FormattedProduct[], total: 0 });

  // Await products for total count (needed for pagination)
  const initialProducts = await productsPromise;

  // Build base query for aggregations (with brand and category filters if applicable)
  const baseQuery = getBaseQuery();
  const brandFilter = buildBrandFilter(brand.name);
  const categoryFilters = categoryPath && categoryPath.ids.categoryIds.length > 0
    ? buildCategoryFilter(categoryPath.ids.categoryIds)
    : [];
  const baseQueryForAggs = {
    must: [...baseQuery.must, brandFilter, ...categoryFilters],
    must_not: baseQuery.must_not,
  };

  // Fetch aggregations server-side for filters
  let aggregations: FilterAggregations | null = null;
  if (elasticIndex) {
    try {
      const filterState = {
        ...(Object.keys(variantAttributes).length > 0 && { variantAttributes }),
        ...(Object.keys(productSpecifications).length > 0 && {
          productSpecifications,
        }),
        ...(inStock !== undefined && { inStock }),
        ...(priceRange && { priceRange }),
        ...(catalogCodes && catalogCodes.length > 0 && { catalogCodes }),
        ...(equipmentCodes && equipmentCodes.length > 0 && { equipmentCodes }),
      };

      const aggregationResponse = await SearchService.getFilterAggregations(
        elasticIndex,
        baseQueryForAggs,
        Object.keys(filterState).length > 0 ? filterState : undefined,
        context
      );

      if (aggregationResponse.success) {
        aggregations = aggregationResponse.aggregations as FilterAggregations;
      }
    } catch (error) {
      console.error("Error fetching aggregations for brand category page:", error);
      // Continue without aggregations - filters will show loading state
    }
  }

  // Get breadcrumbs
  const breadcrumbs = BrandResolutionService.getBrandBreadcrumbs(
    brand,
    categories.length > 0 ? categories : undefined,
    locale
  );

  const categoryName =
    categoryPath && categoryPath.nodes.length > 0
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
            prefetch={true}
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            View all brands in this category →
          </Link>
        )}
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
        currentCategoryPath={categories}
        categoryPath={categoryPath}
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
              categoryName={categoryName}
              locale={locale}
            />
          </Suspense>
        </div>
      </BrandCategoryPageInteractivity>
    </div>
  );
}

/**
 * Brand Product Grid Wrapper Component
 * Handles async product fetching with proper error handling
 */
async function BrandProductGridWrapper({
  productsPromise,
  brandName,
  categoryName,
  locale,
}: {
  productsPromise: Promise<{ products: FormattedProduct[]; total: number }>;
  brandName: string;
  categoryName: string | null;
  locale: string;
}) {
  const { products } = await productsPromise;

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">
          No {brandName} products found
          {categoryName ? ` in ${categoryName}` : ""}.
        </p>
      </div>
    );
  }

  return <ProductViewSwitcher products={products} locale={locale} />;
}
