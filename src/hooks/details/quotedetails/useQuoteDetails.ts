import { useMemo } from "react";
import type { QuotationDetailsResponse } from "@/lib/api";
import type { Version } from "@/types/details/orderdetails/version.types";
import type { SelectedVersion } from "@/types/details/orderdetails/version.types";

interface UseQuoteDetailsParams {
  quoteDetails: QuotationDetailsResponse | null;
  quoteIdentifier: string;
  selectedVersion: SelectedVersion | null;
}

export function useQuoteDetails({
  quoteDetails,
  quoteIdentifier,
  selectedVersion,
}: UseQuoteDetailsParams) {
  // Extract versions from quote details
  const versions = useMemo(() => {
    return (
      quoteDetails?.data?.quotationDetails
        ?.map((quote, index) => {
          const version: Version = {
            versionNumber: index + 1,
            sentBy: (quote.modifiedByUsername as string) || "",
            sentDate: (quote.versionCreatedTimestamp as string) || "",
            orderId: quoteIdentifier,
            orderIdentifier: quoteDetails?.data?.quotationIdentifier || "",
            orderVersion: (quote.quotationVersion as number) || index + 1,
          };
          if (quote.versionName) {
            version.versionName = quote.versionName as string;
          }
          return version;
        })
        .filter(Boolean) || []
    );
  }, [
    quoteDetails?.data?.quotationDetails,
    quoteDetails?.data?.quotationIdentifier,
    quoteIdentifier,
  ]);

  // Get quote identifier
  const quotationIdentifier = useMemo(() => {
    if (selectedVersion?.orderIdentifier) {
      return selectedVersion.orderIdentifier;
    }
    const versionWithIdentifier = versions.find(
      (v: Version) => v.versionNumber === selectedVersion?.versionNumber
    );
    if (versionWithIdentifier?.orderIdentifier) {
      return versionWithIdentifier.orderIdentifier;
    }
    return quoteDetails?.data?.quotationIdentifier || quoteIdentifier || "";
  }, [
    versions,
    selectedVersion,
    quoteDetails?.data?.quotationIdentifier,
    quoteIdentifier,
  ]);

  const quotationVersion = useMemo(() => {
    if (!selectedVersion) return null;
    return selectedVersion.orderVersion || selectedVersion.versionNumber;
  }, [selectedVersion]);

  return {
    versions,
    quotationIdentifier,
    quotationVersion,
  };
}
