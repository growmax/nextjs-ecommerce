"use client";
import { usePageScroll } from "@/hooks/usePageScroll";
import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import OrdersLandingPageClient from "./components/OrdersLandingPageClient";

export default function OrdersLandingPage() {
  usePageScroll();
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls

  return (
     <div>
        <OrdersLandingPageClient />
     </div>
    
   
  );
}
