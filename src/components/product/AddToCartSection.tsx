"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import { useRouter } from "@/i18n/navigation";
import { CartService } from "@/lib/api/CartServices";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddToCartSectionProps {
  productId: number;
  productTitle: string;
  isAvailable: boolean;
}

const CartServices = new CartService();

export default function AddToCartSection({
  productId,
  isAvailable,
}: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuantity, setShowQuantity] = useState(false);
  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const router = useRouter();

  // Validation helper
  const validateBeforeAdd = (): "ok" | "login" | "unavailable" => {
    if (!user?.userId) return "login";
    if (!isAvailable) return "unavailable";
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
          productsId: productId,
          productId: productId,
          quantity: newQuantity,
          itemNo: 0,
          pos: 0,
          addBundle: true,
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
        router.push("/auth/login");
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
        toast.info("Please login to add products to cart");
        router.push("/auth/login");
      }
      return;
    }

    // Handle increment
    if (action === "increment") {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      const success = await updateCart(newQuantity);
      if (!success) {
        toast.info("Please login to update cart");
        router.push("/auth/login");
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
        toast.info("Please login to update cart");
        router.push("/auth/login");
      }
    }
  };
  return (
    <div className="hidden lg:block space-y-4">
      {!showQuantity ? (
        <Button
          size="lg"
          className="w-full h-11 text-sm font-semibold"
          onClick={() => handleQuantityChange("initial")}
          disabled={!isAvailable || isAddingToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAddingToCart ? "ADDING..." : "ADD TO CART"}
        </Button>
      ) : (
        <div className="flex items-center border rounded-lg h-11 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={
              quantity === 1
                ? handleRemoveFromCart
                : () => handleQuantityChange("decrement")
            }
            className="rounded-r-none h-full w-14 flex items-center justify-center"
          >
            {quantity === 1 ? (
              <Trash2 className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1 text-center font-semibold text-base border-x py-2 h-full flex items-center justify-center">
            {quantity}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange("increment")}
            className="rounded-l-none h-full w-14 flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
