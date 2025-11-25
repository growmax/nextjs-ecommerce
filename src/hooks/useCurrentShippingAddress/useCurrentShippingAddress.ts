"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useEffect, useState } from "react";
import useShipping from "@/hooks/useShipping/useShipping";

interface ShippingAddress {
  id?: string | number;
  [key: string]: unknown;
}

interface UserData {
  userId?: number;
  companyId?: number;
}

export default function useCurrentShippingAddress(
  userData: UserData | null = null
) {
  const { isAuthenticated } = useUserDetails();
  const [currentData, setCurrentData] = useState<ShippingAddress>({});
  const { ShippingAddressData, ShippingAddressDataLoading } =
    useShipping(userData);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Server-side rendering check
    if (typeof window === "undefined") {
      return;
    }

    // If user is not authenticated, clear everything
    if (!isAuthenticated) {
      setCurrentData({});
      localStorage.removeItem("SelectedShippingAddressData");
      setIsInitialized(false);
      return;
    }

    // If still loading, wait
    if (ShippingAddressDataLoading) {
      return;
    }

    // Only initialize once per authentication session
    if (isInitialized) {
      return;
    }

    // Get data from localStorage
    const storedData = localStorage.getItem("SelectedShippingAddressData");

    // Try to parse stored data
    let parsedData: ShippingAddress | null = null;
    if (storedData && storedData !== "undefined" && storedData !== "null") {
      try {
        parsedData = JSON.parse(storedData);
        // Validate parsed data has an id
        if (!parsedData?.id) {
          parsedData = null;
        }
      } catch {
        parsedData = null;
      }
    }

    // If we have valid stored data, use it
    if (parsedData) {
      setCurrentData(parsedData);
      setIsInitialized(true);
    }
    // Otherwise, use first address from API if available
    else if (ShippingAddressData && ShippingAddressData.length > 0) {
      const firstAddress = ShippingAddressData[0] as ShippingAddress;
      setCurrentData(firstAddress);
      localStorage.setItem(
        "SelectedShippingAddressData",
        JSON.stringify(firstAddress)
      );
      setIsInitialized(true);
    }
    // No stored data and no API data
    else {
      setCurrentData({});
      setIsInitialized(true);
    }
  }, [
    isAuthenticated,
    ShippingAddressDataLoading,
    ShippingAddressData,
    isInitialized,
  ]);

  return {
    SelectedShippingAddressData: currentData || {},
    SelectedShippingAddressDatamutate: (newData: ShippingAddress) => {
      setCurrentData(newData);
      localStorage.setItem(
        "SelectedShippingAddressData",
        JSON.stringify(newData)
      );
    },
  };
}
