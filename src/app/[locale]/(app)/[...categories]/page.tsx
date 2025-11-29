import { CategoryBreadcrumbServer } from "@/components/Breadcrumb/CategoryBreadcrumbServer";
import { ProductGridServer } from "@/components/ProductGrid/ProductGridServer";
import { StructuredDataServer } from "@/components/seo/StructuredDataServer";
import type { RequestContext } from "@/lib/api/client";
import SearchService, {
  ElasticSearchQuery,
  FormattedProduct,
} from "@/lib/api/services/SearchService/SearchService";
import TenantService from "@/lib/api/services/TenantService";
import CategoryResolutionService from "@/lib/services/CategoryResolutionService";
import { FilterAggregations } from "@/types/category-filters";
import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CategoryNotFound from "./_components/CategoryNotFound";
import { CategoryPageInteractivity } from "./_components/CategoryPageInteractivity";

interface PageProps {
  params: Promise<{
    locale: string;
    categories?: string[];
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    in_stock?: string;
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
  const { locale, categories = [] } = await params;

  // If no categories, return default metadata
  if (categories.length === 0) {
    return {
      title: "Categories | E-Commerce",
      description: "Browse all product categories",
    };
  }

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

  // If no elasticCode, cannot resolve categories - return not found
  if (!elasticCode) {
    return {
      title: "Category Not Found | E-Commerce",
    };
  }

  // Build RequestContext for service calls
  const context: RequestContext = {
    elasticCode,
    tenantCode,
    ...(tenantOrigin && { origin: tenantOrigin }),
  };

  // Resolve category path with proper RequestContext
  const categoryPath = await CategoryResolutionService.resolveCategories(
    categories,
    context
  );

  if (!categoryPath) {
    return {
      title: "Category Not Found | E-Commerce",
    };
  }

  // Generate metadata
  const metadata = await CategoryResolutionService.generateNextMetadata(
    categoryPath,
    locale,
    baseUrl
  );

  return metadata;
}

/**
 * Pre-generate static params for top categories
 *
 * IMPORTANT: This function runs at build time without tenant context.
 * Since CategoryResolutionService.getCategoryTree() requires elasticCode
 * (which comes from tenant headers at runtime), this will return an empty array.
 *
 * The app relies on dynamicParams = true to handle category pages at runtime.
 *
 * To enable static generation, you would need to:
 * 1. Provide tenant context via environment variables at build time
 * 2. Or pre-generate for specific known tenants
 * 3. Or use a different approach that doesn't require tenant context
 */
export async function generateStaticParams() {
  try {
    // Note: generateStaticParams runs at build time without request headers
    // getCategoryTree() requires RequestContext with elasticCode, which is only
    // available at runtime via headers. Without it, getCategoryTree() returns [].
    //
    // This is intentional - we rely on dynamicParams = true for runtime generation
    const categoryTree = await CategoryResolutionService.getCategoryTree();

    // If no category tree (no tenant context at build time), return empty
    if (!categoryTree || categoryTree.length === 0) {
      return [];
    }

    // Generate params for top-level categories and their first-level children
    const params: { categories: string[] }[] = [];

    // Recursively generate params for all category paths
    const generateParams = (
      nodes: typeof categoryTree,
      path: string[] = []
    ) => {
      nodes.forEach(node => {
        const currentPath = [...path, node.slug];
        params.push({ categories: currentPath });

        // Recursively add children (limit depth to 5 levels for performance)
        if (
          node.children &&
          node.children.length > 0 &&
          currentPath.length < 5
        ) {
          generateParams(node.children, currentPath);
        }
      });
    };

    generateParams(categoryTree);

    // Limit to top 500 for build performance
    return params.slice(0, 500);
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Enable ISR - revalidate every 30 minutes
export const revalidate = 1800;

// Allow dynamic params for categories not pre-generated
export const dynamicParams = true;

/**
 * Category Page - Server Component
 * Handles SEO, initial data fetching, and metadata generation
 */
export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, categories = [] } = await params;
  const filters = await searchParams;

  // If no categories provided, show all products or redirect
  if (categories.length === 0) {
    // You can redirect to home or show all products
    // For now, we'll show a message
    return (
      <>
        <h1 className="text-2xl font-bold">All Categories</h1>
        <p className="text-gray-600">
          Please select a category to browse products.
        </p>
      </>
    );
  }

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

  // If no elasticCode, cannot resolve categories - return 404
  if (!elasticCode) {
    notFound();
  }

  // Build RequestContext for service calls
  const context: RequestContext = {
    elasticCode,
    tenantCode,
    ...(tenantOrigin && { origin: tenantOrigin }),
  };

  // Resolve category path with proper RequestContext
  const categoryPath = await CategoryResolutionService.resolveCategories(
    categories,
    context
  );

  // If category path is invalid, show custom not found page
  if (!categoryPath) {
    return <CategoryNotFound attemptedSlugs={categories} locale={locale} />;
  }

  // Get the last node from the category path for display purposes
  const lastNode = categoryPath.nodes[categoryPath.nodes.length - 1];

  // Generate breadcrumbs for the category path
  const breadcrumbs = CategoryResolutionService.getCategoryBreadcrumbs(
    categoryPath,
    locale
  );

  // Parse filters from searchParams
  const page = parseInt(filters.page || "1", 10);
  const sortBy = parseInt(filters.sort || "1", 10);

  // Parse variant attributes from URL (any key that's not a known filter key)
  const variantAttributes: Record<string, string[]> = {};
  const productSpecifications: Record<string, string[]> = {};
  const knownKeys = new Set(["page", "sort", "in_stock", "catalog_code", "equipment_code"]);

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

  // Use the last category ID in the path (most specific) for filtering
  // If multiple IDs are provided, we can filter by all of them
  const categoryIds = categoryPath.ids.categoryIds;
  if (!categoryIds || categoryIds.length === 0) {
    return <CategoryNotFound attemptedSlugs={categories} locale={locale} />;
  }

  // Build category query
  const { buildCategoryQuery } = await import(
    "@/utils/opensearch/browse-queries"
  );

  // Get elastic index from elasticCode
  const elasticIndex = elasticCode ? `${elasticCode}pgandproducts` : "";

  // Build the base query for aggregations and products
  const queryResult = buildCategoryQuery(categoryIds, {
    page,
    pageSize: 20,
    sortBy: { sortBy },
    ...(Object.keys(variantAttributes).length > 0 && { variantAttributes }),
    ...(Object.keys(productSpecifications).length > 0 && {
      productSpecifications,
    }),
    ...(inStock !== undefined && { inStock }),
    ...(catalogCodes && catalogCodes.length > 0 && { catalogCodes }),
    ...(equipmentCodes && equipmentCodes.length > 0 && { equipmentCodes }),
  });

  // Extract base query for aggregations (need the bool object, not the full query)
  const baseQueryForAggs = queryResult.query.query.bool;

  // Fetch aggregations server-side
  let aggregations: FilterAggregations | null = null;
  if (elasticIndex) {
    try {
      const filterState = {
        ...(Object.keys(variantAttributes).length > 0 && { variantAttributes }),
        ...(Object.keys(productSpecifications).length > 0 && {
          productSpecifications,
        }),
        ...(inStock !== undefined && { inStock }),
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
        
        // Debug logging in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[CategoryPage] Aggregations received:', {
            hasBrands: !!aggregations.brands,
            hasCategories: !!aggregations.categories,
            hasVariantAttributes: !!aggregations.variantAttributes,
            variantAttributesKeys: aggregations.variantAttributes ? Object.keys(aggregations.variantAttributes) : [],
            hasProductSpecifications: !!aggregations.productSpecifications,
            productSpecificationsKeys: aggregations.productSpecifications ? Object.keys(aggregations.productSpecifications) : [],
            rawAggregations: aggregations,
          });
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[CategoryPage] Aggregation fetch failed:', aggregationResponse);
        }
      }
    } catch (error) {
      console.error("Error fetching aggregations:", error);
      // Continue without aggregations - client will handle
    }
  }

  // Create products promise for streaming
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
          console.error("Error fetching initial products:", error);
          return { products: [] as FormattedProduct[], total: 0 };
        }
      })()
    : Promise.resolve({ products: [] as FormattedProduct[], total: 0 });

  // Await products for total count (needed for pagination)
  // But render will stream via Suspense
  const initialProducts = await productsPromise;

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: lastNode?.name || "Category",
    description: `Browse ${categoryPath.fullPath.toLowerCase()} products`,
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

      {/* Category Header - Server-rendered */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {lastNode?.name || "Category"}
        </h1>
      </div>

      {/* Interactivity Controls - Client component for pagination/sorting/filters */}
      <CategoryPageInteractivity
        initialFilters={{
          page,
          sort: sortBy,
        }}
        total={initialProducts.total}
        categoryPath={categoryPath}
        aggregations={aggregations}
        currentCategoryPath={categories}
      />

      {/* Product Grid - Server-rendered for SEO with Suspense for streaming */}
      <div className="relative">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[380px] bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          }
        >
          <ProductGridWrapper
            productsPromise={productsPromise}
            locale={locale}
          />
        </Suspense>
      </div>
    </>
  );
}

/**
 * Product Grid Wrapper Component
 * Handles async product fetching with proper error handling
 */
async function ProductGridWrapper({
  productsPromise,
  locale,
}: {
  productsPromise: Promise<{ products: FormattedProduct[]; total: number }>;
  locale: string;
}) {
  const { products } = await productsPromise;

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No products found.</p>
      </div>
    );
  }

  return <ProductGridServer products={products} locale={locale} />;
}
