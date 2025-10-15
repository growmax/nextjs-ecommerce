import CartServices from "@/lib/api/CartServices";
import { useEffect, useState } from "react";

interface UserData {
  userId?: number;
  companyId?: number;
}

export default function useBilling(userData: UserData | null = null) {
  const userId = userData?.userId;
  const companyId = userData?.companyId;

  const [billingData, setBillingData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (userId && companyId) {
      const body = {
        userId,
        companyId,
      };

      async function fetchBilling() {
        try {
          setLoading(true);
          setError(null);
          const res = (await CartServices.geBilling(body)) as {
            data?: unknown[];
          };

          if (res?.data) {
            setBillingData(res.data);
          }
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      }

      fetchBilling();
    }
  }, [userId, companyId]);

  const formatAddress = (billingData as Record<string, unknown>[] | null)?.map(
    o => {
      return { ...(o.addressId as Record<string, unknown>), id: o.id };
    }
  );

  return { billingDatas: formatAddress || [], loading, error, formatAddress };
}
