import type { RequestContext } from "@/lib/api/client";
import CatalogService from "@/lib/api/services/CatalogService";
import TenantService from "@/lib/api/services/TenantService";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: _locale } = await params;

  return {
    title: "All Categories | E-Commerce",
    description: "Browse all available categories in our store",
    openGraph: {
      title: "All Categories | E-Commerce",
      description: "Browse all available categories in our store",
    },
  };
}

/**
 * Generate slug from category name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * All Categories Page - Server Component
 * Displays all categories in a grid layout
 */
export default async function AllCategoriesPage({ params }: PageProps) {
  const { locale } = await params;

  // Get tenant data from headers
  const headersList = await headers();
  const tenantDomain = headersList.get("x-tenant-domain") || "";
  const tenantOrigin = headersList.get("x-tenant-origin") || "";

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

  // If no elasticCode, cannot fetch categories - show empty state
  let categories: Array<{
    id: number | string;
    name: string;
    imageSource?: string;
    iconSource?: string;
    description?: string;
    slug?: string;
  }> = [];

  if (elasticCode) {
    try {
      // Build RequestContext for service calls
      const context: RequestContext = {
        elasticCode,
        tenantCode,
        ...(tenantOrigin && { origin: tenantOrigin }),
      };

      // Fetch categories from OpenSearch
      categories = await CatalogService.getAllCategories(context);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Don't throw error, just show empty state
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Categories</h1>
        <p className="text-muted-foreground">
          Browse all available categories in our store
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="py-12 text-center rounded-lg border border-dashed">
          <p className="text-lg text-muted-foreground mb-2">
            No categories found
          </p>
          <p className="text-sm text-muted-foreground">
            Please check your connection or try again later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => {
            // Use category slug if available, otherwise generate from name
            const slug = category.slug || generateSlug(category.name);
            // Category route uses [...categories] catch-all, so just use the slug
            const categoryUrl = `/${locale}/${slug}`;

            return (
              <Link
                key={category.id}
                href={categoryUrl}
                className="group flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
              >
                {category.imageSource || category.iconSource ? (
                  <div className="w-full aspect-square mb-3 rounded-md overflow-hidden bg-muted">
                    <img
                      src={category.imageSource || category.iconSource}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        // Fallback to placeholder if image fails
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/200x200?text=" +
                          encodeURIComponent(category.name);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square mb-3 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-sm font-medium text-center line-clamp-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

