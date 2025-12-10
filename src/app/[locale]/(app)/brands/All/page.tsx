import { Link } from "@/i18n/navigation";
import type { RequestContext } from "@/lib/api/client";
import BrandsService from "@/lib/api/services/BrandsService";
import TenantService from "@/lib/api/services/TenantService";
import { Metadata } from "next";
import { headers } from "next/headers";
import { BrandImage } from "./BrandImage";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params: _params,
}: PageProps): Promise<Metadata> {
  return {
    title: "All Brands | E-Commerce",
    description: "Browse all available brands in our store",
    openGraph: {
      title: "All Brands | E-Commerce",
      description: "Browse all available brands in our store",
    },
  };
}

/**
 * Generate slug from brand name
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
 * All Brands Page - Server Component
 * Displays all brands in a grid layout
 */
export default async function AllBrandsPage({ params }: PageProps) {
  await params; // params required for route matching, but locale handled by i18n Link

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

  // Fetch brands (service handles sandbox fallback if no elasticCode)
  let brands: Array<{
    id: number;
    name: string;
    imgUrl?: string;
  }> = [];

  try {
    // Build RequestContext for service calls
    const context: RequestContext = {
      elasticCode,
      tenantCode,
      ...(tenantOrigin && { origin: tenantOrigin }),
    };

    // Fetch brands from OpenSearch
    brands = await BrandsService.getAllBrands(context);
  } catch (error) {
    console.error("Error fetching brands:", error);
    // Don't throw error, just show empty state
  }



  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">All Brands</h1>
        <p className="text-muted-foreground">
          Browse all available brands in our store
        </p>
      </div>

      {brands.length === 0 ? (
        <div className="py-12 text-center rounded-lg border border-dashed">
          <p className="text-lg text-muted-foreground mb-2">
            No brands found
          </p>
          <p className="text-sm text-muted-foreground">
            Please check your connection or try again later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {brands.map((brand) => {
            const slug = generateSlug(brand.name);
            // Note: href doesn't include locale prefix because Link from @/i18n/navigation auto-adds it
            const brandUrl = `/brands/${slug}`;

            return (
              <Link
                key={brand.id}
                href={brandUrl}
                className="group flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
              >
                {brand.imgUrl ? (
                  <div className="w-full aspect-square mb-3 rounded-md overflow-hidden bg-muted">
                    <BrandImage
                      src={brand.imgUrl}
                      alt={brand.name}
                      brandName={brand.name}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square mb-3 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-sm font-medium text-center line-clamp-2 group-hover:text-primary transition-colors">
                  {brand.name}
                </h3>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

