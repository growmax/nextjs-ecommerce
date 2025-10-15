import CartServices from "@/lib/api/CartServices";
import { useEffect, useState } from "react";

interface UserData {
  userId?: number;
  companyId?: number;
}

export default function useShipping(userData: UserData | null = null) {
  const userId = userData?.userId;
  const companyId = userData?.companyId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [formatAddress, setFormatAddress] = useState<unknown[]>([]);

  useEffect(() => {
    if (userId && companyId) {
      const body = {
        userId,
        companyId,
      };

      async function fetchShipping() {
        try {
          setLoading(true);
          setError(null);
          const res = (await CartServices.getShipping(body)) as {
            data?: unknown[];
          };

          if (res?.data) {
            // Store formatted data in state to maintain stable reference
            const formatted =
              (res.data as Record<string, unknown>[])?.map(o => o.addressId) ||
              [];
            setFormatAddress(formatted);
          }
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      }

      fetchShipping();
    }
  }, [userId, companyId]);

  return {
    ShippingAddressData: formatAddress,
    ShippingAddressDataError: error,
    ShippingAddressDataLoading: loading,
  };
}
