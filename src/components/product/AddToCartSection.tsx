"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { CartService } from "@/lib/api/CartServices";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import { useRouter } from "@/i18n/navigation";

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
  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const router = useRouter();

  const handleQuantityChange = (action: "increment" | "decrement") => {
    setQuantity((prev) => {
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

    if (!isAvailable) {
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
          productsId: productId,
          productId: productId,
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
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add product to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="hidden lg:block space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantity:</span>
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange("decrement")}
            disabled={quantity <= 1}
            className="rounded-r-none"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="w-16 text-center font-medium border-x py-2">
            {quantity}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange("increment")}
            className="rounded-l-none"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={!isAvailable || isAddingToCart}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isAddingToCart ? "Adding..." : "Add to Cart"}
      </Button>
    </div>
  );
}

