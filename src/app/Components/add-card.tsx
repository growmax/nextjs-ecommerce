"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function AddCardButton() {
  const t = useTranslations();

  return (
    <Button
      variant="ghost"
      size="icon"
      title={t("ecommerce.cart")}
      aria-label={t("ecommerce.cart")}
      className="relative"
    >
      {/* Shopping Cart Icon */}
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    </Button>
  );
}
