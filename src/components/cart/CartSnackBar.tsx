"use client";

import { Button } from "@/components/ui/button";
import { useCart as useCartContext } from "@/contexts/CartContext";
import { useRouter } from "@/i18n/navigation";
import { cartCalculation } from "@/utils/calculation/cartCalculation";
import { ShoppingCart } from "lucide-react";
import PricingFormat from "@/components/PricingFormat";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface CartSnackBarProps {
  href?: string;
  pushHref?: string;
  customItems?: number;
  customSubTotal?: number;
}

export default function CartSnackBar({
  href = "#cartPriceDetails",
  pushHref,
  customItems,
  customSubTotal,
}: CartSnackBarProps) {
  const router = useRouter();
  const { cart, cartCount } = useCartContext();
  const { user } = useCurrentUser();
  const currency = user?.currency;

  // Calculate cart totals
  const cartCalculationResult =
    cart.length > 0
      ? cartCalculation(cart, true, 0, 2, {
          roundingAdjustment: false,
          itemWiseShippingTax: false,
        } as any)
      : null;

  const totalItems = customItems ?? cartCount ?? 0;
  const subtotal = customSubTotal ?? cartCalculationResult?.totalValue ?? 0;

  const handleClick = () => {
    if (pushHref) {
      router.push(pushHref);
      return;
    }
    if (href && href !== "#cartPriceDetails") {
      window.location.href = href;
    } else if (href === "#cartPriceDetails") {
      // Scroll to price details
      const element = document.getElementById("cartPriceDetails");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  if (!totalItems) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">
                {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </p>
              {subtotal > 0 && (
                <p className="text-xs opacity-90">
                  <PricingFormat
                    {...(currency && { buyerCurrency: currency })}
                    value={subtotal}
                  />
                </p>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClick}
            className="ml-auto"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

