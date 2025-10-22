import CartServices from "@/lib/api/CartServices";
import { useMemo } from "react";
import useSWR from "swr";

interface UserData {
  userId?: number;
  companyId?: number;
}

export default function useShipping(userData: UserData | null = null) {
  const userId = userData?.userId;
  const companyId = userData?.companyId;

  const fetcher = () => {
    if (!userId || !companyId) {
      return Promise.reject(new Error("Missing userId or companyId"));
    }
    return CartServices.getShipping({ userId, companyId });
  };

  const { data, error } = useSWR(
    userId && companyId ? [userId, "Shipping", companyId] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  const formatAddress = useMemo(() => {
    const shippingData = (data as { data?: unknown[] })?.data;
    return (
      (shippingData as Record<string, unknown>[] | null)?.map(
        o => o.addressId
      ) || []
    );
  }, [data]);

  return {
    ShippingAddressData: formatAddress,
    ShippingAddressDataError: error,
    ShippingAddressDataLoading: !error && !data,
  };
}
