import CartServices from "@/lib/api/CartServices";
// Use individual lodash imports for better tree-shaking
import { useQuery } from "@tanstack/react-query";
import find from "lodash/find";
import { useMemo } from "react";

interface CurrencySection {
  sectionDetailName: string;
  sectionDetailValue: string;
}

interface CurrencyModuleData {
  orderCurrencySec?: CurrencySection[];
  quoteCurrencySec?: CurrencySection[];
}

interface User {
  userId?: string | number;
  companyId?: string | number;
  currency?: {
    currencyCode?: string;
  };
}

interface BuyerCurrency {
  currencyCode?: string;
}

export default function useGetCurrencyModuleSettings(
  user: User,
  condition: unknown,
  buyerCurrency: BuyerCurrency
) {
  const userId = user?.userId;
  const companyId = user?.companyId;
  const currency = user?.currency;

  const { data } = useQuery({
    queryKey: [userId, "CurrencyModuleSettings", companyId],
    queryFn: async () => {
      if (!userId || !companyId) {
        throw new Error("Missing userId or companyId");
      }
      return CartServices.getCurrencyModuleSettings({
        userId: userId as string | number,
        companyId: companyId as string | number,
      });
    },
    enabled: !!(userId && companyId && condition),
    staleTime: 60000, // Cache for 60 seconds (was dedupingInterval)
    refetchOnWindowFocus: false, // was revalidateOnFocus: false
  });

  const { minimumOrderValue, minimumQuoteValue } = useMemo(() => {
    const currencyModule = (data as { data?: CurrencyModuleData })?.data;

    if (!currencyModule) {
      return { minimumOrderValue: undefined, minimumQuoteValue: undefined };
    }

    const currencyCode = buyerCurrency?.currencyCode || currency?.currencyCode;

    const minimumOrderValue = find(currencyModule?.orderCurrencySec, [
      "sectionDetailName",
      `ORDER_VALUE_${currencyCode}`,
    ])?.sectionDetailValue;

    const minimumQuoteValue = find(currencyModule?.quoteCurrencySec, [
      "sectionDetailName",
      `QUOTE_VALUE_${currencyCode}`,
    ])?.sectionDetailValue;

    return { minimumOrderValue, minimumQuoteValue };
  }, [data, buyerCurrency?.currencyCode, currency?.currencyCode]);

  return {
    minimumOrderValue,
    minimumQuoteValue,
  };
}
