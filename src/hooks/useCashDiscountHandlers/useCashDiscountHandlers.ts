import cloneDeep from "lodash/cloneDeep";
import { useCallback } from "react";
import { toast } from "sonner";
import type { PaymentTerm } from "@/lib/api";
import type { CartItem } from "@/types/calculation/cart";

interface UseCashDiscountHandlersParams {
  products: CartItem[];
  setProducts: (products: CartItem[]) => void;
  cartValue?: any;
  setCartValue?: (cartValue: any) => void;
  isOrder?: boolean;
}

/**
 * Hook to handle cash discount apply/remove operations
 *
 * @param params - Handler parameters
 * @returns Object with handleCDApply and handleRemoveCD functions
 */
export default function useCashDiscountHandlers({
  products,
  setProducts,
  cartValue: _cartValue,
  setCartValue: _setCartValue,
  isOrder: _isOrder = true,
}: UseCashDiscountHandlersParams) {
  /**
   * Apply cash discount to products
   */
  const handleCDApply = useCallback(
    (
      cashDiscountValue: number,
      islatestTermAvailable: boolean,
      paymentTerms?: PaymentTerm
    ) => {
      // Clone products to avoid mutation
      let dbProducts = cloneDeep(products);

      // Update each product with cash discount value
      dbProducts = dbProducts.map(item => {
        if (!item.originalUnitPrice) {
          item.originalUnitPrice = item.unitPrice;
        }
        item.cashdiscountValue = cashDiscountValue ? cashDiscountValue : 0;
        return item;
      });

      // Update products state - this will trigger recalculation via useOrderCalculation
      setProducts(dbProducts);

      // Show success message
      if (islatestTermAvailable && paymentTerms) {
        toast.success("Payment terms updated with cash discount successfully");
      } else {
        toast.success("Cash discount applied successfully");
      }
    },
    [products, setProducts]
  );

  /**
   * Remove cash discount from products
   */
  const handleRemoveCD = useCallback(
    (_prevTerms?: PaymentTerm) => {
      // Clone products
      let dbProducts = cloneDeep(products);

      // Remove cash discount from products
      dbProducts = dbProducts.map(item => {
        // Restore original price if available
        if (item.originalUnitPrice) {
          item.unitPrice = item.originalUnitPrice;
        }
        item.cashdiscountValue = 0;
        return item;
      });

      // Update products state - this will trigger recalculation via useOrderCalculation
      setProducts(dbProducts);

      // Show success message
      toast.success("Payment terms removed with cash discount successfully");
    },
    [products, setProducts]
  );

  return {
    handleCDApply,
    handleRemoveCD,
  };
}
