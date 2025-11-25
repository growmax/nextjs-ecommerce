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
import { buildCategoryQuery } from "@/utils/opensearch/browse-queries";
import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CategoryPageInteractivity } from "./_components/CategoryPageInteractivity";

interface PageProps {
  params: Promise<{
    locale: string;
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
    const generateParams = (nodes: typeof categoryTree, path: string[] = []) => {
      nodes.forEach((node) => {
        const currentPath = [...path, node.slug];
        params.push({ categories: currentPath });

        // Recursively add children (limit depth to 5 levels for performance)
        if (node.children && node.children.length > 0 && currentPath.length < 5) {
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">All Categories</h1>
        <p className="text-gray-600">Please select a category to browse products.</p>
      </div>
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

  // If category path is invalid, return 404
  if (!categoryPath) {
    notFound();
  }

  // Fetch initial products server-side for SEO
  const page = parseInt(filters.page || "1", 10);
  const sortBy = parseInt(filters.sort || "1", 10);

  // Use the last category ID in the path (most specific) for filtering
  // If multiple IDs are provided, we can filter by all of them
  const categoryIds = categoryPath.ids.categoryIds;
  if (!categoryIds || categoryIds.length === 0) {
    notFound();
  }

  const queryResult = buildCategoryQuery(categoryIds, {
    page,
    pageSize: 20,
    sortBy: { sortBy },
  });

  // Get elastic index from elasticCode
  const elasticIndex = elasticCode ? `${elasticCode}pgandproducts` : "";

  let initialProducts: { products: FormattedProduct[]; total: number } = {
    products: [] as FormattedProduct[],
    total: 0,
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
      console.error("Error fetching initial products:", error);
      // Continue with empty products - client will handle retry
    }
  }

  // Get breadcrumbs
  const breadcrumbs =
    CategoryResolutionService.getCategoryBreadcrumbs(categoryPath, locale);

  const lastNode = categoryPath.nodes[categoryPath.nodes.length - 1];

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
    <div className="container mx-auto px-4 py-8">
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

      {/* Interactivity Controls - Client component for pagination/sorting */}
      <CategoryPageInteractivity
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
            <p className="text-gray-600 text-lg">No products found.</p>
          </div>
        ) : (
          <ProductGridServer products={initialProducts.products} locale={locale} />
        )}
      </div>
    </div>
  );
}

