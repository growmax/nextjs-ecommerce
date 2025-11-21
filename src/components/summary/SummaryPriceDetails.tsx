"use client";

import { useFormContext } from "react-hook-form";
import CartPriceDetails from "@/components/sales/CartPriceDetails";

interface SummaryPriceDetailsProps {
  className?: string;
}

/**
 * Price details component for summary pages
 * Wraps CartPriceDetails with form integration
 * 
 * @param className - Additional CSS classes
 */
export default function SummaryPriceDetails({
  className,
}: SummaryPriceDetailsProps) {
  const { watch } = useFormContext();

  const cartValue = watch("cartValue") || {};
  const currency = watch("currency");
  const taxExempted = watch("taxExempted") || false;
  const isBeforeTax = watch("isOrder") 
    ? watch("orderTerms")?.isBeforeTax 
    : watch("quoteTerms")?.isBeforeTax;
  const getBreakup = watch("getBreakup") || [];
  const VolumeDiscountAvailable = watch("VolumeDiscountAvailable") || false;
  const VDapplied = watch("VDapplied") || false;
  const VDDetails = watch("VDDetails") || {};
  const cartValueLoading = watch("cartValueLoading") || false;

  return (
    <div className={className}>
      <CartPriceDetails
        cartValue={cartValue}
        currency={currency}
        isPricingLoading={cartValueLoading}
        isCart={false}
        taxExempted={taxExempted}
        isBeforeTax={isBeforeTax}
        getBreakup={getBreakup}
        VolumeDiscountAvailable={VolumeDiscountAvailable}
        VDapplied={VDapplied}
        VDDetails={VDDetails}
        roundingAdjustmentEnabled={true}
      />
    </div>
  );
}

