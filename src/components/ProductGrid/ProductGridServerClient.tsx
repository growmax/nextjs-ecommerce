"use client";

import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import useProductDiscounts from "@/hooks/useProductDiscounts";
import { ProductGridServer } from "./ProductGridServer";

interface ProductGridServerClientProps {
  products: FormattedProduct[];
  locale?: string;
}

/**
 * ProductGridServerClient Component
 * Client wrapper that batches discount fetching for all products
 * Preserves SEO by keeping ProductGridServer as Server Component
 */
export function ProductGridServerClient({
  products,
  locale = "en",
}: ProductGridServerClientProps) {
  // Extract product IDs for batch discount fetching
  const productIds = products.map(
    p => p.productId || parseInt(p.id || "0", 10)
  );

  // Batch fetch discount data for all products (ONE API call)
  const { discountdata, discountdataLoading, discountDataError } =
    useProductDiscounts(productIds);

  // Pass discount data to server component
  return (
    <ProductGridServer
      products={products}
      locale={locale}
      discountData={discountdata}
      discountLoading={discountdataLoading}
      discountError={discountDataError}
    />
  );
}


