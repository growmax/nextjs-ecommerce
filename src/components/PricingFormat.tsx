"use client";

import React, { Fragment, memo } from "react";
import * as Accounting from "accounting-js";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantCurrency } from "@/contexts/TenantContext";

interface PricingFormatProps {
  value: number | string;
  buyerCurrency?: {
    symbol: string;
    decimal: string;
    thousand: string;
    precision: number;
  };
}

const PricingFormat = ({ value, buyerCurrency }: PricingFormatProps) => {
  const { user } = useCurrentUser();
  const currency = user?.currency;
  const sellerCurrency = useTenantCurrency();

  // Prioritize: buyerCurrency > user currency > seller currency
  const { symbol, decimal, thousand, precision } = buyerCurrency
    ? buyerCurrency
    : currency
      ? currency
      : sellerCurrency || {
          symbol: "$",
          decimal: ".",
          thousand: ",",
          precision: 2,
        };

  return (
    <Fragment>
      {Accounting.formatMoney(parseFloat(String(value)), {
        symbol,
        decimal,
        thousand,
        precision,
      })}
    </Fragment>
  );
};

export default memo(PricingFormat);
