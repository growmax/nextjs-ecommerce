"use client";

import variantService, {
  VariantData,
  VariantSelection,
} from "@/lib/api/services/VariantService";
import type { ProductDetail } from "@/types/product/product-detail";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElasticVariantAttributes } from "@/types/product/product-group";

interface UseProductVariantsOptions {
  productGroupId: number;
  elasticIndex: string;
  baseProduct: ProductDetail; // Contains pg_index_name field
  context?: {
    origin: string;
    tenantCode: string;
  };
}

interface UseProductVariantsReturn {
  // State
  variants: VariantData[];
  variantGroups: Record<
    string,
    Array<{ value: string; count: number; hexCode?: string }>
  >;
  selectedVariant: VariantData | null;
  selection: VariantSelection;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelection: (selection: VariantSelection) => void;
  clearSelection: () => void;
  findVariantBySelection: (selection: VariantSelection) => VariantData | null;

  // Computed
  hasVariants: boolean;
  selectedAttributes: Record<string, string>;
  isValidSelection: boolean;
  variantAttributes: ElasticVariantAttributes[];
}

export function useProductVariants({
  productGroupId,
  elasticIndex,
  baseProduct,
  context,
}: UseProductVariantsOptions): UseProductVariantsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [variantAttributes, _setVariantAttributes] = useState<
    ElasticVariantAttributes[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelectionState] = useState<VariantSelection>({});

  // Load variants on mount
  useEffect(() => {
    const loadVariants = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Loading variants with params

        if (!productGroupId) {
          throw new Error("Missing productGroupId");
        }

        if (!elasticIndex) {
          throw new Error("Missing elasticIndex");
        }

        // Try to fetch Product Group structure and variants together
        const groupResult = await variantService.getVariantsWithGroup(
          productGroupId,
          elasticIndex,
          baseProduct?.pg_index_name,
          context
        );

        // Loaded variant data
        setVariants(groupResult.variants || []);
        _setVariantAttributes(groupResult.variantAttributes || []);

        // Initialize selection from URL params if available
        const urlSelection = getSelectionFromUrl(searchParams);

        // Use the freshly loaded variants from groupResult to avoid referencing
        // the outer `variants` state inside this effect (prevents stale dep lint).
        const loadedVariants = groupResult.variants || [];
        if (urlSelection && loadedVariants.length > 0) {
          const matchingVariant = variantService.findVariantByAttributes(
            loadedVariants,
            urlSelection
          );
          if (matchingVariant) {
            setSelectionState(urlSelection);
          }
        }
      } catch (err) {
        console.error("Failed to load variants:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load product variants";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (productGroupId && elasticIndex) {
      loadVariants();
    } else {
      setError("Missing required parameters for variant loading");
      setIsLoading(false);
    }
  }, [
    productGroupId,
    elasticIndex,
    context,
    searchParams,
    baseProduct.pg_index_name,
  ]);

  // Group variants by attributes
  // Use Product Group structure if available, otherwise fallback to inferring from products
  const variantGroups = useMemo(() => {
    if (!variants.length) return {};

    // If we have Product Group variantAttributes, use that structure
    if (variantAttributes.length > 0) {
      return variantService.groupVariantsByProductGroupAttributes(
        variantAttributes,
        variants
      );
    }

    // Fallback to inferring from products (backward compatibility)
    return variantService.groupVariantsByAttributes(variants);
  }, [variants, variantAttributes]);

  // Find currently selected variant
  const selectedVariant = useMemo(() => {
    if (!Object.keys(selection).length || !variants.length) return null;
    return variantService.findVariantByAttributes(variants, selection);
  }, [variants, selection]);

  // Set selection and update URL
  const setSelection = useCallback(
    (newSelection: VariantSelection) => {
      setSelectionState(newSelection);

      // Update URL parameters using Next.js router (no page reload)
      const params = new URLSearchParams(searchParams.toString());

      // Clear existing variant params
      ["color", "size", "material", "style", "pattern"].forEach(param => {
        params.delete(param);
      });

      // Add new selection to URL
      Object.entries(newSelection).forEach(([key, value]) => {
        if (value) {
          params.set(key.toLowerCase(), value);
        }
      });

      // Update URL without page reload
      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelection({});
  }, [setSelection]);

  // Find variant by selection
  const findVariantBySelection = useCallback(
    (selectionToFind: VariantSelection) => {
      return variantService.findVariantByAttributes(variants, selectionToFind);
    },
    [variants]
  );

  // Computed values
  // Check if variants exist: must have variant groups with options OR variant attributes defined
  const hasVariants = useMemo(() => {
    // If Product Group has variantAttributeses defined, show variants
    if (variantAttributes.length > 0) {
      return true;
    }
    // Check if variantGroups has any options (this is the key check)
    const hasVariantGroups =
      Object.keys(variantGroups).length > 0 &&
      Object.values(variantGroups).some(group => group && group.length > 0);
    // Only show variants if we have actual variant groups with options
    // Don't show just because there are multiple products - they need to have attributes
    return hasVariantGroups;
  }, [variantAttributes.length, variantGroups]);
  const selectedAttributes = useMemo(() => {
    const attrs: Record<string, string> = {};
    Object.entries(selection).forEach(([key, value]) => {
      if (value) {
        attrs[key] = value;
      }
    });
    return attrs;
  }, [selection]);

  const isValidSelection = useMemo(() => {
    return selectedVariant !== null;
  }, [selectedVariant]);

  return {
    // State
    variants,
    variantGroups,
    variantAttributes,
    selectedVariant,
    selection,
    isLoading,
    error,

    // Actions
    setSelection,
    clearSelection,
    findVariantBySelection,

    // Computed
    hasVariants,
    selectedAttributes,
    isValidSelection,
  };
}

// Helper function to extract selection from URL parameters
function getSelectionFromUrl(searchParams: URLSearchParams): VariantSelection {
  const selection: VariantSelection = {};

  // Common variant parameters
  const variantParams = ["color", "size", "material", "style", "pattern"];

  variantParams.forEach(param => {
    const value = searchParams.get(param);
    if (value) {
      selection[param] = value;
    }
  });

  return selection;
}

export default useProductVariants;
