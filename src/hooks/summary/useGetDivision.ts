"use client";

import { useQuery } from "@tanstack/react-query";
import { filter, map } from "lodash";
import _ from "lodash";
import SalesService from "@/lib/api/services/SalesService/SalesService";

/**
 * Hook to fetch divisions and determine the most common division from products
 * Migrated from buyer-fe/src/components/Summary/hooks/useGetDivision.js
 *
 * @param products - Array of products to determine division from
 * @returns Most common division from products
 */
export default function useGetDivision(
  products?: Array<{ division?: { id: number } }>
) {
  const { data } = useQuery({
    queryKey: ["getDivision"],
    queryFn: async () => {
      return await SalesService.getDivision();
    },
    enabled: products !== undefined && (products?.length ?? 0) > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes - divisions don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });

  let division = null;
  let productDivisionIds: (number | undefined)[] = [];

  if (data && products && products.length > 0) {
    productDivisionIds = map(products, o => {
      if (o.division) {
        return o.division.id;
      }
      return undefined;
    });

    // Find the most common division ID
    const result = _.head(
      _(productDivisionIds).countBy().entries().maxBy(_.last)
    );

    if (result) {
      division =
        filter(
          data,
          o => parseInt(String(o.id)) === parseInt(String(result))
        )[0] || null;
    }
  }

  return {
    division,
  };
}
