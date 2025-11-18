"use client";

import { memo, useMemo } from "react";
import { ProductDetail } from "@/types/product/product-detail";
import { VariantData } from "@/lib/api/services/VariantService";
import { formatPrice, getProductAvailability } from "@/utils/product/product-formatter";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface VariantProductDisplayProps {
  baseProduct: ProductDetail;
  selectedVariant: VariantData | null;
  className?: string;
}

function VariantProductDisplay({
  baseProduct,
  selectedVariant,
  className,
}: VariantProductDisplayProps) {
  // Use selected variant data if available, otherwise fall back to base product
  const displayProduct = useMemo(() => {
    if (!selectedVariant) return baseProduct;

    return {
      ...baseProduct,
      product_id: selectedVariant.product_id,
      title: selectedVariant.title,
      product_short_description: selectedVariant.product_short_description,
      brand_name: selectedVariant.brand_name,
      brand_product_id: selectedVariant.brand_product_id,
      unit_list_price: selectedVariant.pricing.unit_list_price,
      unit_mrp: selectedVariant.pricing.unit_mrp,
      product_assetss: selectedVariant.images,
      inventory: selectedVariant.inventory,
    };
  }, [baseProduct, selectedVariant]);

  const primaryImageUrl = useMemo(() => {
    const images = displayProduct.product_assetss || [];
    console.log("Display images:", images);
    
    if (!images.length) {
      return "/asset/default-placeholder.png";
    }
    
    // Find primary image from the product assets
    const primaryImageAsset = images.find(img => img.isDefault) || images[0];
    const imageUrl = primaryImageAsset?.source;
    
    console.log("Primary image URL:", imageUrl);
    
    // Validate image URL
    if (!imageUrl || imageUrl.trim() === "") {
      console.warn("Empty image source, using fallback");
      return "/asset/default-placeholder.png";
    }
    
    return imageUrl;
  }, [displayProduct.product_assetss]);

  const availability = useMemo(() => {
    return getProductAvailability(displayProduct);
  }, [displayProduct]);

  const hasVariantChanged = selectedVariant && selectedVariant.product_id !== baseProduct.product_id;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Variant Change Indicator */}
      {hasVariantChanged && (
        <div className="flex items-center space-x-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <Badge variant="default" className="text-xs">
            Variant Selected
          </Badge>
          <span className="text-sm text-muted-foreground">
            Showing {selectedVariant.attributes.color && `${selectedVariant.attributes.color} `}
            {selectedVariant.attributes.size && `${selectedVariant.attributes.size} `}
            variant
          </span>
        </div>
      )}

      {/* Product Title */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {displayProduct.title || displayProduct.product_short_description}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center">
            <span className="font-medium">Brand:</span>
            <span className="ml-1">{displayProduct.brand_name}</span>
          </span>
          
          {displayProduct.brand_product_id && (
            <span className="flex items-center">
              <span className="font-medium">SKU:</span>
              <span className="ml-1 font-mono">{displayProduct.brand_product_id}</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Image */}
      {primaryImageUrl && (
        <div className="relative">
          <div className="aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100">
            <img
              src={primaryImageUrl}
              alt={displayProduct.title || displayProduct.product_short_description}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="eager"
              onError={(e) => {
                console.warn("Image failed to load:", primaryImageUrl);
                e.currentTarget.src = "/asset/default-placeholder.png";
              }}
            />
          </div>
          
          {/* Variant-specific badges */}
          {selectedVariant && (
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {selectedVariant.attributes.color && (
                <Badge variant="secondary" className="text-xs">
                  {selectedVariant.attributes.color}
                </Badge>
              )}
              {selectedVariant.attributes.size && (
                <Badge variant="secondary" className="text-xs">
                  {selectedVariant.attributes.size}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pricing */}
      <div className="space-y-3">
        <div className="flex items-baseline space-x-3">
          <span className="text-3xl font-bold text-foreground">
            {formatPrice(displayProduct.unit_list_price)}
          </span>
          
          {displayProduct.unit_mrp && displayProduct.unit_mrp > displayProduct.unit_list_price && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(displayProduct.unit_mrp)}
            </span>
          )}
          
          {displayProduct.unit_mrp && displayProduct.unit_mrp > displayProduct.unit_list_price && (
            <Badge variant="destructive" className="text-xs">
              {Math.round(
                ((displayProduct.unit_mrp - displayProduct.unit_list_price) /
                  displayProduct.unit_mrp) *
                  100
              )}
              % OFF
            </Badge>
          )}
        </div>

        {/* Price breakdown for variants */}
        {selectedVariant && selectedVariant.product_id !== baseProduct.product_id && (
          <div className="text-sm text-muted-foreground">
            <span>Variant pricing applied</span>
          </div>
        )}
      </div>

      {/* Availability Status */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              availability.available ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span className="font-medium">
            {availability.available ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {availability.message && (
          <p className="text-sm text-muted-foreground">
            {availability.message}
          </p>
        )}
      </div>

      {/* Variant-specific attributes display */}
      {selectedVariant && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold">Selected Options:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedVariant.attributes).map(([key, value]) => {
                if (!value) return null;
                
                const displayName = key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <Badge key={key} variant="outline" className="text-xs">
                    {displayName}: {value}
                  </Badge>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Product Description */}
      {displayProduct.product_short_description && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold">Description:</h3>
            <p className="text-muted-foreground leading-relaxed">
              {displayProduct.product_short_description}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(VariantProductDisplay);
