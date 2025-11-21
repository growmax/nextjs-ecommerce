import {
  calculateAllSellerCartPricing,
  findBestPricingMatch,
  getOverallCartSummary,
  groupCartItemsBySeller,
} from "@/utils/calculation/sellerCartUtils/sellerCartUtils";
// Use individual lodash imports for better tree-shaking
import { assign_pricelist_discounts_data_to_products } from "@/utils/functionalUtils";
import isEmpty from "lodash/isEmpty";
import { useEffect, useMemo, useState } from "react";
import useMultipleSellerPricing from "./useMultipleSellerPricing";

const useMultipleSellerCart = (cartItems: any, calculationParams: any = {}) => {
  // Initialize selectedSellerId from localStorage
  const [selectedSellerId, setSelectedSellerId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedSellerId") || null;
    }
    return null;
  });

  // Extract seller IDs from cart items
  const sellerIds = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return [];
    const groupedCarts = groupCartItemsBySeller(cartItems);
    return Object.keys(groupedCarts);
  }, [cartItems]);

  // Fetch seller-specific pricing data from discount service
  const {
    sellerPricingData,
    isLoading: pricingLoading,
    revalidate: revalidatePricing,
  } = useMultipleSellerPricing(cartItems, sellerIds);

  // Group and calculate seller carts with proper pricing
  const processedSellerCarts = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return {};
    }
    // Group items by seller with debug logging

    const groupedCarts: any = groupCartItemsBySeller(cartItems, true);

    const enhancedCarts: any = {};

    Object.keys(groupedCarts).forEach((sellerId: any) => {
      const cart = groupedCarts[sellerId];

      const itemsWithSellerPricing = cart.items.map((item: any) => {
        const itemPricing = findBestPricingMatch(item, sellerPricingData);

        if (itemPricing) {
          const pricedItem: any = assign_pricelist_discounts_data_to_products(
            { ...item, showPrice: true },
            itemPricing
          );

          // Preserve the pricing source for debugging
          pricedItem.pricingSource = itemPricing.pricingSource;
          pricedItem.matchedSellerId = itemPricing.matchedSellerId;
          // Ensure showPrice is set to true when we have valid pricing
          pricedItem.showPrice = true;
          return pricedItem;
        }

        return {
          ...item,
          priceNotAvailable: true,
          showPrice: false,
          pricingSource: "no-pricing",
        };
      });

      enhancedCarts[sellerId] = {
        ...cart,
        items: itemsWithSellerPricing,
        seller: {
          ...cart.seller, // Keep any real seller data
        },
      };
    });

    // Calculate pricing for each seller with their specific pricing
    const cartsWithPricing = calculateAllSellerCartPricing(
      enhancedCarts,
      calculationParams
    );
    return cartsWithPricing;
  }, [cartItems, calculationParams, sellerPricingData]);

  // Calculate overall summary
  const overallSummary = useMemo(() => {
    return getOverallCartSummary(processedSellerCarts);
  }, [processedSellerCarts]);

  // Update state when processed carts change
  // useEffect(() => {
  //   setSellerCarts(processedSellerCarts);
  //   setOverallSummary(summary);
  // }, [processedSellerCarts]);

  // Auto-select seller: prefer persisted selection, then first available
  useEffect(() => {
    const sellerIds = Object.keys(processedSellerCarts);

    if (sellerIds.length > 0) {
      const firstSellerId = sellerIds[0];
      // If we have a selectedSellerId but it's not in the current cart, clear it
      if (selectedSellerId && !sellerIds.includes(selectedSellerId)) {
        if (firstSellerId) {
          setSelectedSellerId(firstSellerId);
          if (typeof window !== "undefined") {
            localStorage.setItem("selectedSellerId", firstSellerId);
          }
        }
      }
      // If no seller selected, select the first one
      else if (!selectedSellerId && firstSellerId) {
        setSelectedSellerId(firstSellerId);
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedSellerId", firstSellerId);
        }
      }
    } else {
      // Clear selection when cart is empty
      if (selectedSellerId) {
        setSelectedSellerId(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("selectedSellerId");
        }
      }
    }
  }, [processedSellerCarts, selectedSellerId]);

  // Handle seller selection

  const handleSellerSelect = (sellerId: any) => {
    setSelectedSellerId(sellerId);
    // Persist to localStorage
    if (typeof window !== "undefined" && sellerId) {
      localStorage.setItem("selectedSellerId", sellerId);
    }
  };

  // Get selected seller cart
  const selectedSellerCart = selectedSellerId
    ? (processedSellerCarts as Record<string, any>)[selectedSellerId]
    : null;

  // Get selected seller items for checkout
  const selectedSellerItems = selectedSellerCart
    ? selectedSellerCart.items
    : [];

  // Check if multiple sellers exist
  const hasMultipleSellers = Object.keys(processedSellerCarts).length > 1;

  // Get seller IDs from processed carts
  const processedSellerIds = Object.keys(processedSellerCarts);

  return {
    sellerCarts: processedSellerCarts,
    selectedSellerId,
    selectedSellerCart,
    selectedSellerItems,
    overallSummary,
    handleSellerSelect,
    hasMultipleSellers,
    sellerIds: processedSellerIds,
    isEmpty: isEmpty(processedSellerCarts),
    isLoading: pricingLoading,
    isPricingLoading: pricingLoading, // Expose pricing loading state explicitly
    refreshPricing: revalidatePricing,
  };
};

export default useMultipleSellerCart;
