import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import { PageProps } from "@/types";
import { Metadata } from "next";
import { Suspense } from "react";
import ProductListClient from "./ProductListClient";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryToUse = category || "all";
  const categoryName =
    categoryToUse === "all"
      ? "All Products"
      : categoryToUse
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase());

  return {
    title: `${categoryName} | Browse Products | E-Commerce`,
    description: `Browse ${categoryName.toLowerCase()} in our catalog`,
  };
}

// Enable ISR for category pages - revalidate every 30 minutes
export const revalidate = 1800; // 30 minutes

export default async function BrowseCategoryPage({ params }: PageProps) {
  const { category } = await params;

  // Handle "all" category or fallback to "all" for any invalid category
  const categoryToUse = category === "all" || !category ? "all" : category;

  return (
    <Suspense fallback={<PageLoader message="Loading products..." />}>
      <ProductListClient initialCategory={categoryToUse} />
    </Suspense>
  );
}
