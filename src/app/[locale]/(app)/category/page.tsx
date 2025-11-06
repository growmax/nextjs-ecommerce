"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const CategoryPageClient = dynamic(() => import("./CategoryPageClient"), {
  ssr: false,
  loading: () => <PageLoader message="Loading CategoryPage..." />,
});

export default function CategoryPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading CategoryPage..." />}>
      <CategoryPageClient />
    </Suspense>
  );
}
