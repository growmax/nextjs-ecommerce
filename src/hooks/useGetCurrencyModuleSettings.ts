import CartServices from "@/lib/api/CartServices";
import { find } from "lodash";
import { useMemo } from "react";
import useSWR from "swr";

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

  const fetcher = () => {
    if (!userId || !companyId) {
      return Promise.reject(new Error("Missing userId or companyId"));
    }
    return CartServices.getCurrencyModuleSettings({
      userId: userId as string | number,
      companyId: companyId as string | number,
    });
  };

  const { data } = useSWR(
    userId && companyId && condition
      ? [userId, "CurrencyModuleSettings", companyId]
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 60 seconds (settings rarely change)
    }
  );

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
