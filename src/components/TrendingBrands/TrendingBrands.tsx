"use client";

import { cn } from "@/lib/utils";
import { useBlockingLoader } from "@/providers/BlockingLoaderProvider";
import type { BrandFilterOption } from "@/types/category-filters";
import { TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

interface TrendingBrandsProps {
  brands: BrandFilterOption[];
  selectedBrands?: string[];
  onBrandClick?: (brandValue: string) => void;
}

export function TrendingBrands({
  brands,
  selectedBrands = [],
  onBrandClick,
}: TrendingBrandsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showLoader, hideLoader } = useBlockingLoader();

  // Show/hide blocking loader when transition state changes
  useEffect(() => {
    if (isPending) {
      showLoader({ message: "Loading brand..." });
    } else {
      hideLoader();
    }
  }, [isPending, showLoader, hideLoader]);

  // Show top brands (limit to 10 for better UX)
  const displayBrands = brands.slice(0, 10);

  const handleBrandClick = (brand: BrandFilterOption) => {
    // Call the optional callback if provided
    if (onBrandClick) {
      onBrandClick(brand.value);
    }

    // Navigate to brand page with loading state
    // The navigationPath already includes locale prefix from formatBrandsAggregation
    startTransition(() => {
      router.push(brand.navigationPath);
    });
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      {/* Trending Label */}
      <div className="flex items-center gap-1.5 px-3 h-10 border border-border rounded-md bg-background shrink-0">
        <TrendingUp className="w-4 h-4 text-foreground" />
        <span className="text-sm font-medium text-foreground">Trending</span>
      </div>

      {/* Brand Buttons */}
      {displayBrands.map((brand) => {
        const isSelected = selectedBrands?.includes(brand.value);

        return (
          <button
            key={brand.value}
            onClick={() => handleBrandClick(brand)}
            className={cn(
              "min-w-[80px] h-10 px-3 py-2",
              "border rounded-md",
              "flex items-center justify-center",
              "transition-all duration-200",
              "hover:border-primary hover:shadow-sm",
              "shrink-0",
              "relative overflow-hidden", // For shimmer effect
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-foreground"
            )}
          >
            {/* Shimmer Effect - Visible on white background */}
            <div
              className="absolute top-0 h-full pointer-events-none shine-effect"
              style={{
                width: '40px',
                background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent)',
                transform: 'skewX(-20deg)',
              }}
            />
            
            {/* Brand Name */}
            <span className="text-sm font-medium truncate relative z-10">
              {brand.label}
            </span>

            {/* Keyframe Animation */}
            <style jsx>{`
              .shine-effect {
                animation: shimmer-sweep 2.5s ease-in-out infinite;
              }
              
              @keyframes shimmer-sweep {
                0% {
                  left: -40px;
                  opacity: 0;
                }
                10% {
                  opacity: 1;
                }
                35% {
                  left: 110%;
                  opacity: 1;
                }
                36%, 100% {
                  left: 110%;
                  opacity: 0;
                }
              }
            `}</style>
          </button>
        );
      })}
    </div>
  );
}
