"use client";

import { useQuery } from "@tanstack/react-query";
import SalesService from "@/lib/api/services/SalesService/SalesService";

/**
 * Hook to fetch channels
 * Migrated from buyer-fe/src/components/Summary/hooks/useGetChannel.js
 *
 * @returns Channel data with loading state
 */
export default function useGetChannel() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["getChannel"],
    queryFn: async () => {
      return await SalesService.getChannel();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - channels don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });

  return {
    channel: data && data.length > 0 ? data[0] : null,
    channelList: data || [],
    channelLoading: isLoading || (!error && !data),
  };
}
