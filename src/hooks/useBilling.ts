import CartServices from "@/lib/api/CartServices";
import { useMemo } from "react";
import useSWR from "swr";

interface UserData {
  userId?: number;
  companyId?: number;
}

export default function useBilling(userData: UserData | null = null) {
  const userId = userData?.userId;
  const companyId = userData?.companyId;

  const fetcher = () => {
    if (!userId || !companyId) {
      return Promise.reject(new Error("Missing userId or companyId"));
    }
    return CartServices.geBilling({ userId, companyId });
  };

  const { data, error } = useSWR(
    userId && companyId ? [userId, "Billing", companyId] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

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
    loading: !error && !data,
    error,
    formatAddress,
  };
}
