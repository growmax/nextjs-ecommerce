"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";

const CategoryPageClient = dynamic(() => import("./CategoryPageClient"), {
  ssr: false,
  loading: () => <PageLoader message="Loading CategoryPage..." />,
});

export default CategoryPageClient;
