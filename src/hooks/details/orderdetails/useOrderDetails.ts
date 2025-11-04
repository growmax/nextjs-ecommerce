import { useMemo } from "react";
import type { OrderDetailsResponse } from "@/lib/api";
import type { Version } from "@/types/details/orderdetails/version.types";
import type { SelectedVersion } from "@/types/details/orderdetails/version.types";

interface UseOrderDetailsParams {
  orderDetails: OrderDetailsResponse | null;
  orderId: string;
  selectedVersion: SelectedVersion | null;
}

export function useOrderDetails({
  orderDetails,
  orderId,
  selectedVersion,
}: UseOrderDetailsParams) {
  // Extract versions from order details
  const versions = useMemo(() => {
    return (
      orderDetails?.data?.orderDetails
        ?.map((order, index) => {
          const version: Version = {
            versionNumber: index + 1,
            sentBy: (order.modifiedByUsername as string) || "",
            sentDate: (order.versionCreatedTimestamp as string) || "",
            orderId,
            orderIdentifier: orderDetails?.data?.orderIdentifier || "",
            orderVersion: (order.orderVersion as number) || index + 1,
          };
          if (order.versionName) {
            version.versionName = order.versionName as string;
          }
          return version;
        })
        .filter(Boolean) || []
    );
  }, [
    orderDetails?.data?.orderDetails,
    orderDetails?.data?.orderIdentifier,
    orderId,
  ]);

  // Get order identifier
  const orderIdentifier = useMemo(() => {
    if (selectedVersion?.orderIdentifier) {
      return selectedVersion.orderIdentifier;
    }
    const versionWithIdentifier = versions.find(
      (v: Version) => v.versionNumber === selectedVersion?.versionNumber
    );
    if (versionWithIdentifier?.orderIdentifier) {
      return versionWithIdentifier.orderIdentifier;
    }
    return orderDetails?.data?.orderIdentifier || orderId || "";
  }, [versions, selectedVersion, orderDetails?.data?.orderIdentifier, orderId]);

  const orderVersion = useMemo(() => {
    if (!selectedVersion) return null;
    return selectedVersion.orderVersion || selectedVersion.versionNumber;
  }, [selectedVersion]);

  return {
    versions,
    orderIdentifier,
    orderVersion,
  };
}
