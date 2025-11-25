"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function AddCardButton() {
  const t = useTranslations();
  const { cartCount } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      title={t("ecommerce.cart")}
      aria-label={t("ecommerce.cart")}
      className="relative"
      asChild
    >
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-xs font-semibold"
          >
            {cartCount > 99 ? "99+" : cartCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
