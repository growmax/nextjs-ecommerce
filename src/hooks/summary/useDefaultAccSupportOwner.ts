"use client";

import useUser from "@/hooks/useUser";
import AccountOwnerService from "@/lib/api/services/AccountOwnerService/AccountOwnerService";
import { useQuery } from "@tanstack/react-query";
import { compact, filter } from "lodash";

/**
 * Hook to fetch default account and support owners
 * Migrated from buyer-fe/src/components/Summary/hooks/useDefaultAccSupportOwner.js
 *
 * @returns Account and support owners with loading state
 */
export default function useDefaultAccSupportOwner() {
  const { companydata } = useUser();
  const companyId = (companydata as { companyId?: number })?.companyId;

  const { data, error, isLoading } = useQuery({
    queryKey: ["defaultaccSupportOwner", companyId],
    queryFn: async () => {
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      return await AccountOwnerService.getAccountOwners(companyId);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Filter active account owners (similar to buyer-fe logic)
  const formattedResult = compact(filter(data?.accountOwner, "isActive"));

  return {
    defaultAccSupportOwner: formattedResult || [],
    defaultAccSupportOwnerLoading: isLoading || (!error && !data),
  };
}
