"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

function CategoryPageLoader() {
  const t = useTranslations("category");
  return <PageLoader message={t("loadingCategoryPage")} />;
}

const CategoryPageClient = dynamic(() => import("./CategoryPageClient"), {
  ssr: false,
  loading: () => <CategoryPageLoader />,
});

export default function CategoryPage() {
  return (
    <Suspense fallback={<CategoryPageLoader />}>
      <CategoryPageClient />
    </Suspense>
  );
}
