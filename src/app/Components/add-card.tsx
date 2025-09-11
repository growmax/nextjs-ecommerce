"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafeTranslation } from "@/hooks/use-safe-translation";

export default function AddCardButton() {
  const { t } = useSafeTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      title={t("ecommerce.addToCart", "Add to Cart")}
      aria-label={t("ecommerce.addToCart", "Add to Cart")}
    >
      <Plus className="h-5 w-5" />
    </Button>
  );
}
