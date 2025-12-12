"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import CartPageClient from "./components/CartPageClient";

export default function Page() {
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls
  return (
    <ErrorBoundary>
       <div>
       <CartPageClient />
       </div>
       
     
    </ErrorBoundary>
  );
}
