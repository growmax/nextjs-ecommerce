import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import CartPageClient from "@/app/[locale]/(app)/cart/components/CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart | E-Commerce",
  description: "Review and manage your shopping cart items",
};

function CartPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-6 relative">
                  {/* Product Image Skeleton */}
                  <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

                  {/* Product Info - Center */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    {/* Brand Name and Product ID */}
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    {/* Seller (optional) */}
                    <Skeleton className="h-4 w-40 mb-2" />
                    {/* Price Display */}
                    <div className="flex flex-col gap-1 mb-2">
                      <Skeleton className="h-5 w-24" />
                    </div>
                    {/* Quantity, Pack of, and MOQ */}
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>

                  {/* Right Section - Quantity Controls and Delete */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Delete Button */}
                    <Skeleton className="h-8 w-8 rounded-md" />
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-5 w-8" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Price Summary Skeleton */}
        <div>
          <div className="sticky top-4 space-y-4">
            {/* Price Details Card */}
            <div className="border rounded-lg p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
            </div>
            {/* Proceed Button Skeleton */}
            <Skeleton className="h-12 w-full rounded" />
          </div>
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
