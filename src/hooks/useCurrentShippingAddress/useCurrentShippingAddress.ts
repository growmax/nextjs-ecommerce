"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useEffect, useMemo, useState } from "react";
import useShipping from "../useShipping";
import useUser from "../useUser";

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
  const { companydata } = useUser();
  
  // Get userId and companyId from userData parameter or from useUser hook (like old useDefault pattern)
  const userId = useMemo(() => {
    return userData?.userId || (companydata as { userId?: number })?.userId;
  }, [userData?.userId, companydata]);
  
  const companyId = useMemo(() => {
    return userData?.companyId || (companydata as { companyId?: number })?.companyId;
  }, [userData?.companyId, companydata]);
  
  // Build userData object for useShipping
  const shippingUserData = useMemo(() => {
    if (userId && companyId) {
      return { userId, companyId };
    }
    return null;
  }, [userId, companyId]);
  
  const [currentData, setCurrentData] = useState<ShippingAddress>({});

  // Get localStorage data on render (like old code pattern)
  const storedDataString =
    typeof window !== "undefined"
      ? localStorage.getItem("SelectedShippingAddressData")
      : null;

  const { ShippingAddressData, ShippingAddressDataLoading } =
    useShipping(shippingUserData);

  // Reset currentData when userId/companyId changes (new user session)
  useEffect(() => {
    if (userId && companyId) {
      // Only reset if we don't have data yet
      setCurrentData(prev => {
        if (!Object.keys(prev).length) {
          return {};
        }
        return prev;
      });
    }
  }, [userId, companyId]);

  useEffect(() => {
    // Server-side rendering check
    if (typeof window === "undefined") {
      return;
    }

    // If user is not authenticated, clear everything
    if (!isAuthenticated) {
      setCurrentData({});
      localStorage.removeItem("SelectedShippingAddressData");
      return;
    }

    // Need userId and companyId to fetch shipping data
    if (!userId || !companyId) {
      return;
    }

    // If still loading, wait
    if (ShippingAddressDataLoading) {
      return;
    }

    // Get current data from state to check if it's empty
    setCurrentData(prevData => {
      // Handle stored data from localStorage
      if (storedDataString && storedDataString !== "undefined" && storedDataString !== "null") {
        try {
          const parsedData = JSON.parse(storedDataString);
          // Validate parsed data has an id
          if (parsedData?.id) {
            // Only set if prevData is empty (like old code pattern)
            if (!Object.keys(prevData).length) {
              return parsedData;
            }
            return prevData; // Don't override existing data
          } else {
            // Invalid stored data, remove it
            localStorage.removeItem("SelectedShippingAddressData");
          }
        } catch {
          // Invalid JSON, remove it
          localStorage.removeItem("SelectedShippingAddressData");
        }
      }

      // If no valid stored data and prevData is empty, use first address from API if available
      // Only update if prevData is empty (like old code: !Object?.keys(currentData).length)
      if (!Object.keys(prevData).length && ShippingAddressData && ShippingAddressData.length > 0) {
        const firstAddress = ShippingAddressData[0] as ShippingAddress;
        // Ensure the address has an id before using it
        if (firstAddress && (firstAddress.id || (firstAddress as any)?.addressId?.id)) {
          localStorage.setItem(
            "SelectedShippingAddressData",
            JSON.stringify(firstAddress)
          );
          return firstAddress;
        }
      }

      return prevData;
    });
  }, [
    isAuthenticated,
    ShippingAddressDataLoading,
    ShippingAddressData,
    storedDataString,
    userId,
    companyId, // Reset when userId/companyId changes
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
