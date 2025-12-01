"use client";

import AddToCartSection from "@/components/product/AddToCartSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductListItem } from "@/types/product-listing";

import { useEffect, useState } from "react";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=Broken Image";

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
  const [imageSrc, setImageSrc] = useState(product.image);

  useEffect(() => {
    setImageSrc(product.image);
  }, [product.image]);

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
          className={`relative ${
            isGrid
              ? "w-full aspect-[16/10]"
              : "w-full md:w-2/5 aspect-[16/10] md:aspect-auto md:min-w-[180px] md:max-w-[280px] shrink-0 md:py-6"
          }`}
        >
          <img
            src={imageSrc || PLACEHOLDER_IMAGE}
            alt={product.title}
            onError={() => setImageSrc(PLACEHOLDER_IMAGE)}
            className={`object-cover absolute inset-0 ${
              isGrid ? "h-full w-full" : "h-full w-full md:h-[calc(100%-48px)] md:top-6 md:rounded-md"
            }`}
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

            <p className="text-sm text-muted-foreground">
              Brand: {product.brand}
            </p>
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>

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
