"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import PricingFormat from "@/components/PricingFormat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductDetail } from "@/types/product/product-detail";
import {
  calculateDiscountPercentage,
  formatLeadTime,
  getProductAvailability,
} from "@/utils/product/product-formatter";
import { Share2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductHeroProps {
  product: ProductDetail;
  locale: string;
}

export default function ProductHero({ product, locale }: ProductHeroProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const brandName = product.brand_name || product.brands_name || "Generic";
  const availability = getProductAvailability(product);
  const images = product.product_assetss?.filter(img => img.source) || [];
  const primaryImage =
    images.find(img => img.isDefault)?.source ||
    images[0]?.source ||
    "/asset/default-placeholder.png";
  const selectedImage = images[selectedImageIndex]?.source || primaryImage;

  const discountPercentage = calculateDiscountPercentage(
    product.unit_mrp,
    product.unit_list_price
  );

  const minOrderQty = parseFloat(product.min_order_quantity) || 1;
  const leadTime = formatLeadTime(product.standard_lead_time, product.lead_uom);

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.product_short_description,
          url: window.location.href,
        });
      } catch (err) {}
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image Gallery Section */}
      <div className="space-y-4">
        {/* Main Image */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="relative aspect-square w-full bg-white rounded-lg overflow-hidden">
              <ImageWithFallback
                src={selectedImage}
                alt={product.title}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && (
                  <Badge variant="default" className="bg-green-500">
                    New
                  </Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="destructive">{discountPercentage}% Off</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index
                    ? "border-primary"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image
                  src={image.source}
                  alt={`${product.title} view ${index + 1}`}
                  fill
                  className="object-contain bg-white"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Information Section */}
      <div className="space-y-6">
        {/* Brand */}
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            {brandName}
          </p>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {product.title}
          </h1>
          {product.product_short_description && (
            <p className="mt-2 text-lg text-muted-foreground">
              {product.product_short_description}
            </p>
          )}
        </div>

        {/* SKU & Product Code */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">SKU:</span>{" "}
            <span className="font-medium">{product.brand_product_id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Product Code:</span>{" "}
            <span className="font-medium">{product.product_index_name}</span>
          </div>
        </div>

        {/* Availability */}
        <div>
          <Badge
            variant={availability.available ? "default" : "secondary"}
            className={availability.available ? "bg-green-500" : ""}
          >
            {availability.message}
          </Badge>
          {leadTime && (
            <p className="mt-2 text-sm text-muted-foreground">
              Lead Time: {leadTime}
            </p>
          )}
        </div>

        {/* Price */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  <PricingFormat value={product.unit_list_price} />
                </span>
                {product.unit_mrp > product.unit_list_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    <PricingFormat value={product.unit_mrp} />
                  </span>
                )}
              </div>

              {product.is_tax_inclusive && (
                <p className="text-sm text-muted-foreground">
                  (Inclusive of all taxes)
                </p>
              )}

              {product.hsn_code && (
                <div className="text-sm">
                  <span className="text-muted-foreground">HSN Code:</span>{" "}
                  <span className="font-medium">{product.hsn_code}</span>
                  {product.hsn_tax && (
                    <span className="text-muted-foreground ml-2">
                      ({product.hsn_tax}% Tax)
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quantity Selector */}
        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium">
            Quantity
            {minOrderQty > 1 && (
              <span className="text-muted-foreground ml-2">
                (Min: {minOrderQty})
              </span>
            )}
          </label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(minOrderQty, quantity - 1))}
              disabled={quantity <= minOrderQty}
            >
              -
            </Button>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={e => {
                const val = parseInt(e.target.value) || minOrderQty;
                setQuantity(Math.max(minOrderQty, val));
              }}
              min={minOrderQty}
              className="w-20 text-center border rounded-md px-3 py-2"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!availability.available}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <Button size="lg" variant="outline" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Additional Info */}
        <div className="border-t pt-4 space-y-2 text-sm">
          {product.unit_of_measure && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit:</span>
              <span className="font-medium">{product.unit_of_measure}</span>
            </div>
          )}
          {product.packaging_qty && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packaging Qty:</span>
              <span className="font-medium">{product.packaging_qty}</span>
            </div>
          )}
          {product.net_weight && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">{product.net_weight}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
