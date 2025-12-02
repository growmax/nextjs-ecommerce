"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import AddToCartSection from "@/components/product/AddToCartSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductListItem } from "@/types/product-listing";

interface ProductCardProps {
  product: ProductListItem;
  viewMode?: "grid" | "list" | "table";
}

/**
 * ProductCard Component
 * Displays product information in a card format (grid or list)
 */
export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const isGrid = viewMode === "grid";

  return (
    <Card
      className={`group transition-shadow hover:shadow-lg overflow-hidden ${
        isGrid ? "h-full flex flex-col min-h-[380px]" : "flex flex-col md:flex-row min-h-[220px]"
      }`}
    >
      <CardContent
        className={`p-0 flex ${
          isGrid ? "flex-col h-full" : "flex-col md:flex-row w-full md:pl-6"
        }`}
      >
        {/* Product Image */}
        <div
          className={`relative bg-white ${
            isGrid
              ? "w-full aspect-square"
              : "w-full md:w-2/5 aspect-square md:aspect-auto md:min-w-[180px] md:max-w-[280px] shrink-0 md:py-6"
          }`}
        >
          <ImageWithFallback
            src={product.image}
            alt={product.title}
            fill
            className={`object-contain ${
              isGrid ? "p-4" : "md:rounded-md p-2"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.isNew && (
            <Badge
              className={`absolute top-6 left-2 bg-red-500 hover:bg-red-600 ${
                !isGrid ? "md:top-12" : ""
              }`}
            >
              New
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 p-2 md:p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="line-clamp-2 text-base font-medium leading-tight">
              {product.title}
            </h3>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-blue-600">
                ₹{product.price}
              </span>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300">
              Brand: {product.brand}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">SKU: {product.sku}</p>

            {/* Stock Status */}
            {!product.inStock && (
              <Badge variant="destructive" className="text-xs w-fit">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="pt-5 mt-auto">
            <AddToCartSection
              productId={product.id}
              productTitle={product.title}
              isAvailable={product.inStock}
              className={`w-full ${!isGrid ? "md:w-1/2" : ""}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
