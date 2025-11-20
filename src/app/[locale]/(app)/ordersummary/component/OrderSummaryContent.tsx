"use client";
import { SalesHeader } from "@/components/sales";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import { useRouter } from "next/navigation";
export default function OrderSummaryContent() {
  const router = useRouter();
  const { prefetch } = useRoutePrefetch();
  const handlePlaceOrder = () => {};
  const handleClose = () => {
    prefetch("/cart");
    router.push(`/cart`);
  };
  return (
    <div>
      <SalesHeader
        title={"Blue Quote"}
        identifier={""}
        buttons={[
          {
            label: "CANCEL",
            variant: "outline",
            onClick: handleClose,
          },
          {
            label: "PLACE ORDER",
            variant: "default",
            onClick: handlePlaceOrder,
          },
        ]}
      />
    </div>
  );
}
