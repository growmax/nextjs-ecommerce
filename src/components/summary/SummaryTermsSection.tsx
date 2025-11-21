"use client";

import { useFormContext } from "react-hook-form";
import OrderTermsCard from "@/components/sales/terms-card";

interface SummaryTermsSectionProps {
  isOrder?: boolean;
  className?: string;
}

/**
 * Terms section component for summary pages
 * Wraps OrderTermsCard with form integration
 * 
 * @param isOrder - Whether this is an order (true) or quote (false)
 * @param className - Additional CSS classes
 */
export default function SummaryTermsSection({
  isOrder = false,
  className,
}: SummaryTermsSectionProps) {
  const { watch } = useFormContext();

  // Get terms from form - orderTerms for orders, quoteTerms for quotes
  const orderTerms = watch(isOrder ? "orderTerms" : "quoteTerms");
  const preferences = watch("preferences");
  const deliveryPlace = watch("deliveryPlace");
  const additionalTerms = watch("additionalTerms");

  // Merge terms data
  const termsData = {
    ...orderTerms,
    ...preferences,
    deliveryTermsCode2: deliveryPlace,
    additionalTerms: additionalTerms,
  };

  return (
    <div className={className}>
      <OrderTermsCard orderTerms={termsData} />
    </div>
  );
}

