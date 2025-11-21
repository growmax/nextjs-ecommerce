"use client";

import { useProductVariantContext } from "@/contexts/ProductVariantContext";
import AddToCartSection from "./AddToCartSection";

interface AddToCartSectionWrapperProps {
  baseProductId: number;
  productTitle: string;
  isAvailable: boolean;
}

export default function AddToCartSectionWrapper({
  baseProductId,
  productTitle,
  isAvailable,
}: AddToCartSectionWrapperProps) {
  const { selectedVariant } = useProductVariantContext();

  // Use variant product_id if selected, otherwise use base product_id
  const productId = selectedVariant?.product_id || baseProductId;

  return (
    <AddToCartSection
      productId={productId}
      productTitle={productTitle}
      isAvailable={isAvailable}
    />
  );
}

