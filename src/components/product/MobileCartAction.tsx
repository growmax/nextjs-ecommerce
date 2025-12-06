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
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MobileCartActionProps {
  product: ProductDetail;
}

const CartServices = new CartService();

export default function MobileCartAction({ product }: MobileCartActionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuantity, setShowQuantity] = useState(false);
  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const router = useRouter();

  const availability = getProductAvailability(product);

  // Validation helper
  const validateBeforeAdd = (): "ok" | "login" | "unavailable" => {
    if (!user?.userId) return "login";
    if (!availability.available) return "unavailable";
    return "ok";
  };

  // Reusable API function
  const updateCart = async (newQuantity: number): Promise<boolean> => {
    if (!user?.userId) return false;

    try {
      setIsAddingToCart(true);
      await CartServices.postCart({
        userId: Number(user.userId),
        tenantId: tenantData?.tenant?.tenantCode || "",
        useMultiSellerCart: true,
        body: {
          productsId: product.product_id,
          productId: product.product_id,
          quantity: newQuantity,
          itemNo: 0,
          pos: 0,
        },
      });
      toast.success(
        `Cart updated: ${newQuantity} ${newQuantity > 1 ? "items" : "item"}`
      );
      return true;
    } catch {
      toast.error("Failed to update cart. Please try again.");
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Remove from cart
  const handleRemoveFromCart = () => {
    setQuantity(1);
    setShowQuantity(false);
    setIsAddingToCart(false);
    toast.info("Removed from cart");
  };

  // Unified quantity change handler
  const handleQuantityChange = async (
    action: "initial" | "increment" | "decrement"
  ) => {
    // Handle initial add to cart
    if (action === "initial") {
      const validation = validateBeforeAdd();
      if (validation === "login") {
        toast.info("Please login to add products to cart");
        router.push("/login");
        return;
      }
      if (validation === "unavailable") {
        toast.error("This product is currently unavailable");
        return;
      }
      setQuantity(1);
      setShowQuantity(true);
      const success = await updateCart(1);
      if (!success) {
        setShowQuantity(false);
      }
      return;
    }

    // Handle increment
    if (action === "increment") {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      const success = await updateCart(newQuantity);
      if (!success) {
        setQuantity(quantity);
      }
      return;
    }

    // Handle decrement
    if (action === "decrement") {
      const newQuantity = Math.max(1, quantity - 1);
      if (newQuantity === 1 && quantity === 1) {
        handleRemoveFromCart();
        return;
      }
      setQuantity(newQuantity);
      const success = await updateCart(newQuantity);
      if (!success) {
        setQuantity(quantity);
      }
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "bg-background/95 backdrop-blur-sm border-t shadow-lg"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-6 mx-2 sm:mx-3">
          {/* Left Side: Price + Stock */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {/* Price Label + Stock Indicator */}
            <div className="flex items-center gap-1">
              <span className="text-sm sm:text-base font-medium text-gray-600">
                Price
              </span>
              {availability.available && product.show_price !== false && (
                <div className="flex items-center gap-0.5">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-green-500 rounded-full" />
                  <span className="text-xs font-semibold text-green-600">
                    In Stock
                  </span>
                </div>
              )}
            </div>

            {/* Price Value */}
            <span className="text-lg sm:text-xl font-bold text-foreground">
              {product.show_price !== false ? (
                formatPrice(product.unit_list_price)
              ) : (
                <span className="text-sm text-muted-foreground">
                  Contact for price
                </span>
              )}
            </span>

            {product.show_price === false && (
              <span className="text-xs text-muted-foreground pt-1">
                Contact seller for pricing
              </span>
            )}
          </div>

          {/* Right Side: Button or Quantity Selector */}
          {product.show_price !== false && !showQuantity && (
            <Button
              size="lg"
              className="h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-lg bg-black text-white hover:bg-neutral-900 active:scale-95 transition flex items-center gap-2 whitespace-nowrap min-w-40 sm:min-w-52 text-sm sm:text-base flex-shrink-0"
              onClick={() => handleQuantityChange("initial")}
              disabled={!availability.available || isAddingToCart}
              aria-label={`Add ${product.product_short_description || "item"} to cart`}
            >
              <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
              <span className="font-medium">
                {isAddingToCart ? "Adding..." : "ADD TO CART"}
              </span>
            </Button>
          )}

          {product.show_price !== false && showQuantity && (
            <div className="flex items-center border border-gray-300 rounded-lg sm:rounded-lg h-10 sm:h-12 bg-white min-w-40 sm:min-w-52 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={
                  quantity === 1
                    ? handleRemoveFromCart
                    : () => handleQuantityChange("decrement")
                }
                disabled={isAddingToCart}
                className="w-10 sm:w-12 h-full rounded-l-lg hover:bg-gray-100 flex items-center justify-center active:bg-gray-200"
                aria-label="Decrease quantity"
              >
                {quantity === 1 ? (
                  <Trash2 className="h-5 sm:h-5 w-5 sm:w-5 text-red-600 font-bold" />
                ) : (
                  <Minus className="h-5 sm:h-5 w-5 sm:w-5 text-gray-900 font-bold" />
                )}
              </Button>
              <div className="flex-1 text-center font-bold text-base sm:text-lg text-gray-900 border-x border-gray-300 flex items-center justify-center">
                {quantity}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange("increment")}
                disabled={isAddingToCart}
                className="w-10 sm:w-12 h-full rounded-r-lg hover:bg-gray-100 flex items-center justify-center active:bg-gray-200"
                aria-label="Increase quantity"
              >
                <Plus className="h-5 sm:h-5 w-5 sm:w-5 text-gray-900 font-bold" />
              </Button>
            </div>
          )}

          {product.show_price === false && (
            <Button
              size="lg"
              className="h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-lg bg-black text-white hover:bg-neutral-900 active:scale-95 transition flex items-center gap-2 whitespace-nowrap min-w-40 sm:min-w-52 text-sm sm:text-base flex-shrink-0"
              onClick={() => handleQuantityChange("initial")}
              disabled={!availability.available || isAddingToCart}
              aria-label="Request quote"
            >
              <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
              <span className="font-medium">
                {isAddingToCart ? "Adding..." : "REQUEST QUOTE"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Safe area for devices with notches/home indicators */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </div>
  );
}
