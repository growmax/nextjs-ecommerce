"use client";

import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { ProductCard } from "@/components/ProductList/ProductCard";
import { ProductListItem } from "@/types/product-listing";

interface ProductGridProps {
  products: FormattedProduct[];
  viewMode?: "grid" | "list";
}

/**
 * Transform FormattedProduct to ProductListItem
 */
function transformProduct(product: FormattedProduct): ProductListItem {
  const productId =
    product.productId ||
    parseInt(product.id || "0", 10) ||
    0;
  const productName =
    product.productName ||
    product.productShortDescription ||
    product.shortDescription ||
    "Product";
  const productImage =
    (product.productAssetss && Array.isArray(product.productAssetss) && product.productAssetss[0]?.source) ||
    (product.productAssets && Array.isArray(product.productAssets) && product.productAssets[0]?.source) ||
    "/placeholder-product.jpg";
  const productPrice: number =
    (typeof product.unitListPrice === "number" ? product.unitListPrice : 0) ||
    (typeof product.unitPrice === "number" ? product.unitPrice : 0) ||
    (typeof product.b2CUnitListPrice === "number" ? product.b2CUnitListPrice : 0) ||
    (typeof product.b2CDiscountPrice === "number" ? product.b2CDiscountPrice : 0) ||
    0;
  const brandName =
    product.brandName || product.brandsName || "";
  const sku =
    product.brandProductId ||
    product.productIndexName ||
    product.id ||
    "";

  return {
    id: productId,
    sku: String(sku),
    title: productName,
    brand: brandName,
    price: productPrice, // Price in base currency units
    image: productImage,
    images: product.productAssetss?.map((asset) => asset.source) || [],
    isNew: false, // You can add logic to determine if product is new
    inStock: true, // You can add stock check logic here
    category: "", // Can be populated from categoryPath if needed
  };
}

/**
 * ProductGrid Component
 * Displays products in a responsive grid layout
 * Reusable for both category and brand pages
 */
export function ProductGrid({ products, viewMode = "grid" }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center rounded-lg">
        <p className="text-lg text-muted-foreground">
          No products found.
        </p>
      </div>
    );
  }

  // Grid columns based on view mode
  const gridCols =
    viewMode === "grid"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-1";

  return (
    <div className={`grid gap-4 md:gap-6 ${gridCols}`}>
      {products.map((product) => {
        const productListItem = transformProduct(product);
        return (
          <ProductCard
            key={productListItem.id}
            product={productListItem}
            viewMode={viewMode}
          />
        );
      })}
    </div>
  );
}

