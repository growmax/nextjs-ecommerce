"use client";

import { useCallback, useEffect } from "react";
import { useProductVariants } from "@/hooks/useProductVariants";
import VariantSelector from "./VariantSelector";
import VariantDebugInfo from "./VariantDebugInfo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useProductVariantContext } from "@/contexts/ProductVariantContext";

interface ProductPageClientProps {
  product: any; // Using any for now to avoid circular dependency
  elasticIndex: string;
  context: {
    origin: string;
    tenantCode: string;
  };
  baseImages: any[]; // Using any for now to avoid circular dependency
}

function VariantLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-16 rounded-lg" />
          <Skeleton className="h-10 w-16 rounded-lg" />
          <Skeleton className="h-10 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPageClient({
  product,
  elasticIndex,
  context,
  baseImages: _baseImages, // Unused parameter
}: ProductPageClientProps) {
  const { setSelectedVariant } = useProductVariantContext();
  const {
    variantGroups,
    variantAttributes,
    selectedVariant,
    selection,
    isLoading,
    error,
    setSelection,
    clearSelection,
    hasVariants,
  } = useProductVariants({
    productGroupId: product.product_group_id,
    elasticIndex,
    baseProduct: product,
    context,
  });

  // Update context when selectedVariant changes
  useEffect(() => {
    setSelectedVariant(selectedVariant);
  }, [selectedVariant, setSelectedVariant]);

  const handleSelectionChange = useCallback(
    (newSelection: typeof selection) => {
      setSelection(newSelection);
    },
    [setSelection]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <VariantLoadingSkeleton />
      </div>
    );
  }

  if (error) {
    console.warn("Variant loading failed:", error);

    // Show error message but don't block the page
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Variant Selection Unavailable
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Unable to load product variants. Showing base product
                information.
              </p>
            </div>
          </div>
        </div>

        <VariantDebugInfo
          product={product}
          variants={[]}
          error={error}
          isLoading={isLoading}
          elasticIndex={elasticIndex}
          context={context}
        />
      </div>
    );
  }

  if (!hasVariants) {
    // No variants found, don't show selector
    return null;
  }

  return (
    <div className="space-y-6 border-t pt-6">
      {/* Variant Selection */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Choose Your Options</h2>
        {Object.keys(selection).length > 0 && (
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear Selection
          </Button>
        )}
      </div>

      <VariantSelector
        variantGroups={variantGroups}
        selection={selection}
        onSelectionChange={handleSelectionChange}
        variantAttributes={variantAttributes}
      />
    </div>
  );
}
