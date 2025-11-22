import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import { Metadata } from "next";
import { Suspense } from "react";
import ProductListClient from "./[category]/ProductListClient";

export const metadata: Metadata = {
  title: "Browse Products | E-Commerce",
  description: "Browse all products in our catalog",
};

// Enable ISR for browse page - revalidate every 30 minutes
export const revalidate = 1800; // 30 minutes

export default async function BrowsePage() {
  return (
    <Suspense fallback={<PageLoader message="Loading products..." />}>
      <ProductListClient initialCategory="all" />
    </Suspense>
  );
}
