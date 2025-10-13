import CartServices from "@/lib/api/CartServices";
import { find } from "lodash";
import { useEffect, useState } from "react";

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
  const [currencyModule, setCurrencyModule] =
    useState<CurrencyModuleData | null>(null);

  useEffect(() => {
    if (!userId || !companyId) return;

    const body = {
      userId: userId as string | number,
      companyId: companyId as string | number,
    };
    async function CurrencyModuleSetting() {
      const res = (await CartServices.getCurrencyModuleSettings(body)) as {
        data?: CurrencyModuleData;
      };
      if (res?.data) {
        setCurrencyModule(res.data);
      }
    }
    CurrencyModuleSetting();
  }, [condition, userId, companyId]);
  let minimumOrderValue, minimumQuoteValue;
  if (currencyModule) {
    minimumOrderValue = find(currencyModule?.orderCurrencySec, [
      "sectionDetailName",
      `ORDER_VALUE_${
        buyerCurrency?.currencyCode
          ? buyerCurrency?.currencyCode
          : currency?.currencyCode
      }`,
    ])?.sectionDetailValue;

    minimumQuoteValue = find(currencyModule?.quoteCurrencySec, [
      "sectionDetailName",
      `QUOTE_VALUE_${
        buyerCurrency?.currencyCode
          ? buyerCurrency?.currencyCode
          : currency?.currencyCode
      }`,
    ])?.sectionDetailValue;
  }
  return {
    minimumOrderValue,
    minimumQuoteValue,
  };
}
