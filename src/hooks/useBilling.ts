import CartServices from "@/lib/api/CartServices";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface UserData {
  userId?: number;
  companyId?: number;
}

export default function useBilling(userData: UserData | null = null) {
  const userId = userData?.userId;
  const companyId = userData?.companyId;

  const { data, error, isLoading } = useQuery({
    queryKey: [userId, "Billing", companyId],
    queryFn: async () => {
      if (!userId || !companyId) {
        throw new Error("Missing userId or companyId");
      }
      return CartServices.geBilling({ userId, companyId });
    },
    enabled: !!(userId && companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes - billing addresses don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // was revalidateOnFocus: false
  });

  const formatAddress = useMemo(() => {
    const billingData = (data as { data?: unknown[] })?.data;
    return (
      (billingData as Record<string, unknown>[] | null)?.map(o => {
        return { ...(o.addressId as Record<string, unknown>), id: o.id };
      }) || []
    );
  }, [data]);

  return {
    billingDatas: formatAddress,
    loading: isLoading,
    error,
    formatAddress,
  };
}
