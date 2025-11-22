"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ProductDetail } from "@/types/product/product-detail";
import { ArrowLeft, Heart, MoreHorizontal, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MobileNavigationProps {
  product: ProductDetail;
  className?: string;
}

export default function MobileNavigation({
  product,
  className,
}: MobileNavigationProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.product_short_description || product.title,
          text:
            product.product_description ||
            `Check out this product: ${product.product_short_description}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied to clipboard");
      }
    } catch (error) {
      // User cancelled sharing or error occurred
      // swallow error; optionally show a toast in the future
      console.debug("Share cancelled or failed:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleMore = () => {
    // Future implementation for more options menu
    toast.info("More options coming soon!");
  };

  return (
    <div
      className={cn(
        "md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border",
        "transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center justify-between p-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-foreground hover:bg-muted/50"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>

        {/* Product Title (truncated) */}
        <div className="flex-1 mx-4 text-center">
          <h1 className="text-sm font-medium text-foreground truncate">
            {product.product_short_description || product.title}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            disabled={isSharing}
            className="h-9 w-9 text-foreground hover:bg-muted/50"
            aria-label="Share product"
          >
            <Share2 className={cn("h-4 w-4", isSharing && "animate-pulse")} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleWishlist}
            className={cn(
              "h-9 w-9 hover:bg-muted/50",
              isWishlisted
                ? "text-red-500 hover:text-red-600"
                : "text-foreground"
            )}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleMore}
            className="h-9 w-9 text-foreground hover:bg-muted/50"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
