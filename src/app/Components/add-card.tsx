"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function AddCardButton() {
  const t = useTranslations();

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
      </Link>
    </Button>
  );
}
