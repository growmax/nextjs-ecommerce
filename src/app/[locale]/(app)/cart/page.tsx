import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import CartPageClient from "./components/CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart | E-Commerce",
  description: "Review and manage your shopping cart items",
};

function CartPageSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CartPageSkeleton />}>
        <CartPageClient />
      </Suspense>
    </ErrorBoundary>
  );
}
