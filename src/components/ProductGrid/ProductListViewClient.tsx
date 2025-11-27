"use client";

import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import useProductDiscounts from "@/hooks/useProductDiscounts";
import { ProductListView } from "./ProductListView";

interface ProductListViewClientProps {
  products: FormattedProduct[];
  locale?: string;
}

/**
 * ProductListViewClient Component
 * Client wrapper that batches discount fetching for all products
 * Preserves SEO by keeping ProductListView as Server Component
 */
export function ProductListViewClient({
  products,
  locale = "en",
}: ProductListViewClientProps) {
  // Extract product IDs for batch discount fetching
  const productIds = products.map(
    p => p.productId || parseInt(p.id || "0", 10)
  );

  // Batch fetch discount data for all products (ONE API call)
  const { discountdata, discountdataLoading, discountDataError } =
    useProductDiscounts(productIds);

  // Pass discount data to server component
  return (
    <ProductListView
      products={products}
      locale={locale}
      discountData={discountdata}
      discountLoading={discountdataLoading}
      discountError={discountDataError}
    />
  );
}



