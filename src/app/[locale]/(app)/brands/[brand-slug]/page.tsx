import { CategoryBreadcrumbServer } from "@/components/Breadcrumb/CategoryBreadcrumbServer";
import { ProductGridServer } from "@/components/ProductGrid/ProductGridServer";
import { StructuredDataServer } from "@/components/seo/StructuredDataServer";
import SearchService, { ElasticSearchQuery, FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import BrandResolutionService from "@/lib/services/BrandResolutionService";
import { buildBrandQuery } from "@/utils/opensearch/browse-queries";
import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BrandCategoryPageInteractivity } from "./[...categories]/_components/BrandCategoryPageInteractivity";

interface PageProps {
  params: Promise<{
    locale: string;
    "brand-slug": string;
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
  const { locale, "brand-slug": brandSlug } = await params;

  // Get tenant context
  const headersList = await headers();
  const tenantCode = headersList.get("x-tenant-code") || "";
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;

  // Resolve brand with tenant context using direct OpenSearch query
  const brand = await BrandResolutionService.getBrandBySlugDirect(brandSlug, {
    tenantCode,
  });

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

/**
 * Pre-generate static params for popular brands
 */
export async function generateStaticParams() {
  try {
    // Note: generateStaticParams runs at build time, so we may not have tenant context
    // This will return empty array if no tenant code is available
    // In production, you may want to pre-generate for specific tenants
    const brands = await BrandResolutionService.getAllBrands();

    return brands.slice(0, 100).map((brand) => ({
      "brand-slug": brand.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Enable ISR - revalidate every 30 minutes
export const revalidate = 1800;

// Allow dynamic params for brands not pre-generated
export const dynamicParams = true;

/**
 * Brand Landing Page - Server Component
 * Shows brand homepage when no category is specified
 */
export default async function BrandPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, "brand-slug": brandSlug } = await params;
  const filters = await searchParams;

  // Get tenant context for API calls
  const headersList = await headers();
  const tenantCode = headersList.get("x-tenant-code") || "";
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;

  // Resolve brand with tenant context using direct OpenSearch query
  const brand = await BrandResolutionService.getBrandBySlugDirect(brandSlug, {
    tenantCode,
  });

  if (!brand) {
    console.error(`[BrandPage] Brand not found for slug: "${brandSlug}" with tenant: "${tenantCode}"`);
    notFound();
  }


  // Fetch initial products server-side for SEO
  const page = parseInt(filters.page || "1", 10);
  const sortBy = parseInt(filters.sort || "1", 10);

  const queryResult = buildBrandQuery(brand.name, {
    page,
    pageSize: 20,
    sortBy: { sortBy },
  });

  // Get elastic index from tenant code
  const elasticIndex = tenantCode ? `${tenantCode}pgandproducts` : "";

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
      console.error(`[BrandPage] Error fetching products for brand "${brand.name}":`, error);
      // Continue with empty products - client will handle retry
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
          </h1>
        </div>
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
              No {brand.name} products found.
            </p>
          </div>
        ) : (
          <ProductGridServer products={initialProducts.products} locale={locale} />
        )}
      </div>
    </div>
  );
}

