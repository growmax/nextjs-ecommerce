import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function CartSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header with breadcrumb and continue shopping */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Seller Card Accordion Skeleton */}
      <div className="space-y-4">
        <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm">
          {/* Accordion Header */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>

          {/* Accordion Content */}
          <div className="pt-4 px-6 pb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left side - Product List Skeleton */}
              <div className="flex-1 space-y-4">
                {/* Product Item 1 */}
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex md:flex-row flex-col border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                  >
                    {/* Image skeleton */}
                    <div className="flex-shrink-0 w-full md:w-40 h-56 md:h-48 bg-gray-200 relative">
                      <Skeleton className="h-full w-full" />
                      {/* Stock badge skeleton */}
                      <div className="absolute top-2 left-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    </div>

                    {/* Content wrapper */}
                    <div className="flex-1 flex flex-col md:flex-row min-w-0">
                      {/* Product details section */}
                      <div className="flex-1 flex flex-col justify-between p-4 md:p-5 min-w-0">
                        <div className="flex justify-between gap-3">
                          <div className="flex flex-col gap-2 flex-1 min-w-0">
                            {/* Product name */}
                            <Skeleton className="h-5 w-full max-w-xs" />
                            <Skeleton className="h-5 w-3/4 max-w-sm" />
                            {/* Brand | HSN */}
                            <Skeleton className="h-4 w-48" />
                            {/* Unit price */}
                            <div className="flex items-baseline gap-2 mt-1">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                          {/* Delete button - mobile */}
                          <Skeleton className="md:hidden h-9 w-9 rounded-lg" />
                        </div>

                        {/* Quantity controls - mobile */}
                        <div className="flex items-center justify-between mt-4 md:hidden">
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-3 w-16" />
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-11 w-11 rounded-lg" />
                              <Skeleton className="h-6 w-8" />
                              <Skeleton className="h-11 w-11 rounded-lg" />
                            </div>
                          </div>
                          {/* Subtotal - mobile */}
                          <div className="flex flex-col items-end gap-1">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                        </div>

                        {/* Quantity controls - desktop */}
                        <div className="hidden md:flex flex-col gap-2 mt-3">
                          <Skeleton className="h-3 w-16" />
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <Skeleton className="h-6 w-8" />
                            <Skeleton className="h-12 w-12 rounded-lg" />
                          </div>
                        </div>
                      </div>

                      {/* Right section - desktop */}
                      <div className="hidden md:flex flex-col justify-between items-end p-5 flex-shrink-0 min-w-[180px]">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        {/* Subtotal - desktop */}
                        <div className="flex flex-col items-end gap-1">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right side - Price Details and Actions Skeleton */}
              <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
                {/* Price Details Skeleton */}
                <Card className="shadow-lg bg-white gap-0 p-0">
                  <CardHeader className="bg-gray-100 text-black py-5 px-8 m-0 rounded-t-lg">
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-5 py-8 px-8">
                    {/* Total Items */}
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Separator />
                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                    {/* Taxable Amount */}
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                    {/* Tax */}
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Separator />
                    {/* Total */}
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="w-full h-14 rounded-lg" />
                  <Skeleton className="w-full h-14 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
