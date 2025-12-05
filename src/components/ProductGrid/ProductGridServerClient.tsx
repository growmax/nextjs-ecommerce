"use client";

import useProductDiscounts from "@/hooks/useProductDiscounts";
import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { ProductGridServer } from "./ProductGridServer";

interface ProductGridServerClientProps {
  products: FormattedProduct[];
}

/**
 * ProductGridServerClient Component
 * Client wrapper that batches discount fetching for all products
 * Preserves SEO by keeping ProductGridServer as Server Component
 */
export function ProductGridServerClient({
  products,
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
      discountData={discountdata}
      discountLoading={discountdataLoading}
      discountError={discountDataError}
    />
  );
}












