"use client";

import { VariantData } from "@/lib/api/services/VariantService";
import { createContext, ReactNode, useContext, useState } from "react";

interface ProductVariantContextType {
  selectedVariant: VariantData | null;
  setSelectedVariant: (variant: VariantData | null) => void;
}

const ProductVariantContext = createContext<
  ProductVariantContextType | undefined
>(undefined);

export function ProductVariantProvider({ children }: { children: ReactNode }) {
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(
    null
  );

  return (
    <ProductVariantContext.Provider
      value={{ selectedVariant, setSelectedVariant }}
    >
      {children}
    </ProductVariantContext.Provider>
  );
}

export function useProductVariantContext() {
  const context = useContext(ProductVariantContext);
  if (context === undefined) {
    throw new Error(
      "useProductVariantContext must be used within a ProductVariantProvider"
    );
  }
  return context;
}
