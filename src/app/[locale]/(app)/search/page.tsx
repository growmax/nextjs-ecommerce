import { CategoryBreadcrumbServer } from "@/components/Breadcrumb/CategoryBreadcrumbServer";
import { Card, CardContent } from "@/components/ui/card";
import SearchService, {
  ElasticSearchQuery,
  FormattedProduct,
} from "@/lib/api/services/SearchService/SearchService";
import TenantService from "@/lib/api/services/TenantService";
import { buildSearchQuery } from "@/utils/opensearch/browse-queries";
import { Package } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { SearchResultsClient } from "./_components/SearchResultsClient";

export const metadata: Metadata = {
  title: "Search Products | E-Commerce",
  description: "Search for products in our catalog",
};

// Enable ISR for search page - revalidate every 30 minutes
export const revalidate = 1800;

interface SearchPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const sortBy = parseInt(resolvedSearchParams.sort || "1", 10);

  // Get tenant data from headers
  const headersList = await headers();
  const tenantDomain = headersList.get("x-tenant-domain") || "";
  const tenantOrigin = headersList.get("x-tenant-origin") || "";

  // Fetch tenant data to get elasticCode
  let elasticCode = "";
  if (tenantDomain && tenantOrigin) {
    try {
      const tenantData = await TenantService.getTenantDataCached(
        tenantDomain,
        tenantOrigin
      );
      elasticCode = tenantData?.data?.tenant?.elasticCode || "";
    } catch (error) {
      console.error("Error fetching tenant data in search page:", error);
    }
  }


  // Build elastic index
  const elasticIndex = elasticCode ? `${elasticCode}pgandproducts` : "";

  // Fetch products if query exists and elasticIndex is available
  let products: FormattedProduct[] = [];
  let total = 0;

  if (query.trim() && elasticIndex) {
    try {
      // Build search query with pagination and sorting
      const queryResult = buildSearchQuery(query.trim(), {
        page,
        pageSize: 20,
        sortBy: { sortBy },
      });

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

      products = result.data || [];
      total = result.total || 0;
    } catch (error) {
      console.error("Error searching products:", error);
      products = [];
      total = 0;
    }
  }

  // Breadcrumbs for search page
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(query
      ? [{ label: `Results for "${query}"`, href: `/search?q=${query}` }]
      : []),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <CategoryBreadcrumbServer breadcrumbs={breadcrumbs} />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Search Results
        </h1>
      </div>

      {/* Results Section */}
      {!query ? (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              No search query
            </h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
              Please enter a search term in the header to find products.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SearchResultsClient
          initialProducts={products}
          initialTotal={total}
          initialPage={page}
          initialSort={sortBy}
          searchQuery={query}
          locale={locale}
        />
      )}
    </div>
  );
}
