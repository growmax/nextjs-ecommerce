import { PageContent } from "@/components/layout/PageContent";
import { Metadata } from "next";
import { Suspense } from "react";
import { ProductListPageClient } from "./ProductListPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Products - Browse Our Catalog",
    description: "Browse our complete product catalog with filters by category, brand, and more.",
  };
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    majorcategory?: string;
    brand?: string;
    pg?: string;
    page?: string;
    sort?: string;
    [key: string]: string | undefined;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  return (
    <PageContent>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductListPageClient searchParams={params} />
      </Suspense>
    </PageContent>
  );
}

function ProductListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg aspect-square" />
          ))}
        </div>
      </div>
    </div>
  );
}



