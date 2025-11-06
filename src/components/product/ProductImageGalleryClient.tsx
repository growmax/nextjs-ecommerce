"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductAsset } from "@/types/product/product-detail";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductImageGalleryClientProps {
  images: ProductAsset[];
  productTitle: string;
}

export default function ProductImageGalleryClient({
  images,
  productTitle,
}: ProductImageGalleryClientProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter valid images and add fallback
  const validImages =
    images && images.length > 0
      ? images.filter(img => img.source)
      : [
          {
            source: "/asset/default-placeholder.png",
            type: "image",
            height: "800",
            width: "800",
            isDefault: true,
          },
        ];

  const handlePrevious = () => {
    setSelectedIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group border border-gray-200">
        {validImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0",
              index === selectedIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            <Image
              src={image.source}
              alt={`${productTitle} - Image ${index + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Navigation Arrows - Show only if multiple images */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white z-20"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white z-20"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-20">
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-gray-200 hover:border-gray-400"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.source}
                alt={`${productTitle} thumbnail ${index + 1}`}
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
