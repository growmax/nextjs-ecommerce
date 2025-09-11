"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function AddCardButton() {
  const t = useTranslations();

  return (
    <Button
      variant="ghost"
      size="icon"
      title={t("ecommerce.addToCart")}
      aria-label={t("ecommerce.addToCart")}
    >
      <Plus className="h-5 w-5" />
    </Button>
  );
}
