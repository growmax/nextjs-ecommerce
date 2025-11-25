import { useMemo } from "react";
import useUser from "@/hooks/useUser/useUser";

export interface AccessControlResult {
  hasQuotePermission: boolean; // MQUOTE_ECQ
  hasOrderPermission: boolean; // MORDER_EPO
  listAccessElements: string[];
  isLoading: boolean;
}

/**
 * Hook to check user access control permissions
 * Checks for MQUOTE_ECQ (Request Quote) and MORDER_EPO (Create Order) permissions
 * from listAccessElements fetched via useUser hook (similar to buyer-fe pattern)
 */
export default function useAccessControl() {
  const { companydata, companyLoading } = useUser();

  const accessControl = useMemo<AccessControlResult>(() => {
    // Extract listAccessElements from companydata (matching buyer-fe pattern)
    const listAccessElements = (companydata as any)?.listAccessElements || [];

    // Check if user has permission to request quotes
    const hasQuotePermission = listAccessElements.includes("MQUOTE_ECQ");

    // Check if user has permission to create orders
    const hasOrderPermission = listAccessElements.includes("MORDER_EPO");

    return {
      hasQuotePermission,
      hasOrderPermission,
      listAccessElements: Array.isArray(listAccessElements)
        ? listAccessElements
        : [],
      isLoading: companyLoading,
    };
  }, [companydata, companyLoading]);

  return accessControl;
}
