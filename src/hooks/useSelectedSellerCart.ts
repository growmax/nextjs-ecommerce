import { useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";
import useMultipleSellerCart from "./useMultipleSellerCart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSelectedSellerCart = (cartItems: any, selectedSellerId: any) => {
  const { user } = useCurrentUser();
  // const { moduleSettings } = useModuleSettings(user);

  const cartData = cartItems || [];

  // Get calculation parameters
  const calculationParams = useMemo(() => {
    return {
      isInter: true,
      insuranceCharges: 0,
      precision: 2,
      Settings: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isSeller: (user as any)?.isSeller || false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      taxExemption: (user as any)?.taxExemption || false,
    };
  }, [user]);

  // Use multiple seller cart hook
  const {
    sellerCarts,
    selectedSellerId: currentSelectedSellerId,
    selectedSellerCart,
    overallSummary,
    hasMultipleSellers,
    sellerIds,
    isPricingLoading,
  } = useMultipleSellerCart(cartData, calculationParams);

  // Get selected seller's data
  const selectedSeller =
    selectedSellerId && sellerCarts[selectedSellerId]
      ? sellerCarts[selectedSellerId]
      : selectedSellerCart;

  // Return data in format expected by existing cart components
  return {
    // Selected seller data
    selectedSellerCart: selectedSeller,
    selectedSellerItems: selectedSeller?.items || [],
    selectedSellerPricing: selectedSeller?.pricing || {},
    selectedSellerId: currentSelectedSellerId || selectedSellerId,

    // All sellers data
    sellerCarts,
    hasMultipleSellers,
    sellerIds,
    overallSummary,

    // Original cart data for compatibility
    cartItems: cartData,

    // Utility flags
    isEmpty: !selectedSeller || !selectedSeller.items?.length,
    isPricingLoading, // Expose pricing loading state
  };
};

export default useSelectedSellerCart;
