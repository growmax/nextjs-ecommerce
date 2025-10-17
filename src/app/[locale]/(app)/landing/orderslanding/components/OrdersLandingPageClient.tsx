"use client";

import { SectionToolbar } from "@/components/Global/SectionToolbar/SectionToolbar";
import { Download } from "lucide-react";
import OrdersLandingTable from "./OrdersLandingTable/OrdersLandingTable";

export default function OrdersLandingPageClient() {
  return (
    <>
      <SectionToolbar
        title="Orders"
        secondary={{
          condition: true,
          value: "Export",
          startIcon: <Download className="h-4 w-4" />,
        }}
        refresh={{
          condition: true,
        }}
      />

      <OrdersLandingTable />
    </>
  );
}
