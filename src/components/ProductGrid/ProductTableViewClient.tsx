"use client";

import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import useProductDiscounts from "@/hooks/useProductDiscounts";
import { ProductTableView } from "./ProductTableView";

interface ProductTableViewClientProps {
  products: FormattedProduct[];
  locale?: string;
}

/**
 * ProductTableViewClient Component
 * Client wrapper that batches discount fetching for all products
 * Preserves SEO by keeping ProductTableView as Server Component
 */
export function ProductTableViewClient({
  products,
  locale = "en",
}: ProductTableViewClientProps) {
  // Extract product IDs for batch discount fetching
  const productIds = products.map(
    p => p.productId || parseInt(p.id || "0", 10)
  );

  // Batch fetch discount data for all products (ONE API call)
  const { discountdata, discountdataLoading, discountDataError } =
    useProductDiscounts(productIds);

  // Pass discount data to server component
  return (
    <ProductTableView
      products={products}
      locale={locale}
      discountData={discountdata}
      discountLoading={discountdataLoading}
      discountError={discountDataError}
    />
  );
}









