"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductAsset } from "@/types/product/product-detail";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useProductVariantContext } from "@/contexts/ProductVariantContext";

interface ProductImageGalleryClientProps {
  images: ProductAsset[];
  productTitle: string;
}

export default function ProductImageGalleryClient({
  images,
  productTitle,
}: ProductImageGalleryClientProps) {
  const { selectedVariant } = useProductVariantContext();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Use variant images if available, otherwise fall back to base images
  const displayImages = useMemo(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images as ProductAsset[];
    }
    return images;
  }, [images, selectedVariant]);

  // Reset selected index when images change
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayImages]);

  // Check if desktop screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    // Initial check
    checkScreenSize();

    // Listen for resize events
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Filter valid images and add fallback
  const validImages = useMemo(() => {
    const imagesToFilter = displayImages || [];
    return imagesToFilter.length > 0
      ? imagesToFilter.filter(img => img.source)
      : [
          {
            source: "/asset/default-placeholder.png",
            type: "image",
            height: "800",
            width: "800",
            isDefault: true,
          },
        ];
  }, [displayImages]);

  const currentImage = validImages[selectedIndex] || validImages[0];

  const handlePrevious = useCallback(() => {
    setSelectedIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [validImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
  }, [validImages.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalOpen) {
        switch (event.key) {
          case "Escape":
            setIsModalOpen(false);
            setIsZoomed(false);
            break;
          case "ArrowLeft":
            handlePrevious();
            break;
          case "ArrowRight":
            handleNext();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handlePrevious, handleNext]);

  // Handle image zoom
  const handleImageClick = (_e: React.MouseEvent<HTMLDivElement>) => {
    if (isDesktop) {
      // Only enable zoom on desktop
      setIsZoomed(!isZoomed);
      // TODO: Implement mouse position tracking for zoom origin
      // const rect = e.currentTarget.getBoundingClientRect();
      // const x = ((e.clientX - rect.left) / rect.width) * 100;
      // const y = ((e.clientY - rect.top) / rect.height) * 100;
    } else {
      // Open modal on mobile
      setIsModalOpen(true);
    }
  };

  // Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
  }, [selectedIndex]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  // Ensure currentImage is always defined
  if (!currentImage) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-gray-500">No image available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image Display */}
        <div
          className={cn(
            "relative aspect-square bg-gray-50 rounded-lg overflow-hidden group border border-gray-200 cursor-pointer",
            "transition-all duration-300 hover:shadow-lg"
          )}
          onClick={handleImageClick}
          role="button"
          tabIndex={0}
          aria-label={`View ${productTitle} image ${selectedIndex + 1} in full size`}
        >
          {/* Main Image */}
          <div className="relative w-full h-full">
            <Image
              src={currentImage.source}
              alt={`${productTitle} - Image ${selectedIndex + 1}`}
              fill
              className={cn(
                "object-contain transition-transform duration-300",
                isZoomed ? "scale-150" : "scale-100"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              priority={selectedIndex === 0}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>

          {/* Zoom indicator */}
          {isDesktop && (
            <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-4 w-4" />
            </div>
          )}

          {/* Mobile: Full screen indicator */}
          <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full md:opacity-0 opacity-100 transition-opacity">
            <Maximize2 className="h-4 w-4" />
          </div>

          {/* Navigation Arrows - Show only if multiple images */}
          {validImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white z-20"
                onClick={e => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white z-20"
                onClick={e => {
                  e.stopPropagation();
                  handleNext();
                }}
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

          {/* Stock overlay for out of stock items */}
          {isZoomed && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                Click to zoom out
              </Badge>
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
                  "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
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
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </button>
            ))}
          </div>
        )}

        {/* Mobile Navigation Dots */}
        {validImages.length > 1 && (
          <div className="flex justify-center gap-2 md:hidden">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  selectedIndex === index
                    ? "bg-primary w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Modal for Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 bg-black/80">
            <div className="text-white">
              <span className="text-sm">
                {selectedIndex + 1} of {validImages.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(false)}
              className="text-white hover:bg-white/20"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Modal Image */}
          <div className="flex-1 relative overflow-hidden">
            <Image
              src={currentImage.source}
              alt={`${productTitle} - Image ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Modal Navigation */}
          {validImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Modal Thumbnail Strip */}
          {validImages.length > 1 && (
            <div className="p-4 bg-black/80">
              <div className="flex gap-2 overflow-x-auto">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all",
                      selectedIndex === index
                        ? "border-white"
                        : "border-transparent hover:border-white/50"
                    )}
                  >
                    <Image
                      src={image.source}
                      alt={`${productTitle} thumbnail ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
