import CartServices from "@/lib/api/CartServices";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface UserData {
  userId?: number;
  companyId?: number;
}

export default function useShipping(userData: UserData | null = null) {
  const userId = userData?.userId;
  const companyId = userData?.companyId;

  const { data, error, isLoading } = useQuery({
    queryKey: [userId, "Shipping", companyId],
    queryFn: async () => {
      if (!userId || !companyId) {
        throw new Error("Missing userId or companyId");
      }
      return CartServices.getShipping({ userId, companyId });
    },
    enabled: !!(userId && companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes - shipping addresses don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // was revalidateOnFocus: false
  });

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
    ShippingAddressDataLoading: isLoading,
  };
}
