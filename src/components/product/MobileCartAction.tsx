"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import { useRouter } from "@/i18n/navigation";
import { CartService } from "@/lib/api/CartServices";
import { cn } from "@/lib/utils";
import { ProductDetail } from "@/types/product/product-detail";
import {
  formatPrice,
  getProductAvailability,
} from "@/utils/product/product-formatter";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MobileCartActionProps {
  product: ProductDetail;
}

const CartServices = new CartService();

export default function MobileCartAction({ product }: MobileCartActionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const router = useRouter();

  const availability = getProductAvailability(product);

  useEffect(() => {
    // Show the mobile cart action bar after a slight delay
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleQuantityChange = (action: "increment" | "decrement") => {
    setQuantity(prev => {
      if (action === "increment") {
        return prev + 1;
      }
      return prev > 1 ? prev - 1 : 1;
    });
  };

  const handleAddToCart = async () => {
    if (!user?.userId) {
      toast.info("Please login to add products to cart");
      router.push("/auth/login");
      return;
    }

    if (!availability.available) {
      toast.error("This product is currently unavailable");
      return;
    }

    try {
      setIsAddingToCart(true);

      await CartServices.postCart({
        userId: Number(user.userId),
        tenantId: tenantData?.tenant?.tenantCode || "",
        useMultiSellerCart: true,
        body: {
          productsId: product.product_id,
          productId: product.product_id,
          quantity,
          itemNo: 0,
          pos: 0,
          addBundle: true,
        },
      });

      toast.success(
        `${quantity} ${quantity > 1 ? "items" : "item"} added to cart`
      );
      setQuantity(1); // Reset quantity after adding
    } catch {
      toast.error("Failed to add product to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "bg-background border-t shadow-lg",
        "transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Price Display */}
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Price</span>
            <span className="text-lg font-bold">
              {formatPrice(product.unit_list_price)}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange("decrement")}
              disabled={quantity <= 1}
              className="h-9 w-9 rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="w-12 text-center font-medium border-x py-2 text-sm">
              {quantity}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange("increment")}
              className="h-9 w-9 rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!availability.available || isAddingToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* Safe area for devices with notches/home indicators */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
}
