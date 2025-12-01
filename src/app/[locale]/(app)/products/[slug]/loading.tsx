import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for product detail page
 * Displays skeleton loaders matching the product page layout
 */
export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Product Hero Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card>
              <CardContent className="p-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
              </CardContent>
            </Card>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product Information Skeleton */}
          <div className="space-y-6">
            {/* Brand */}
            <Skeleton className="h-4 w-32" />

            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>

            {/* SKU & Code */}
            <div className="flex gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-40" />
            </div>

            {/* Availability */}
            <Skeleton className="h-6 w-24" />

            {/* Price Card */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>

            {/* Quantity */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-12" />
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>

        {/* Product Information Card Skeleton */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 border-b pb-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Specifications Card Skeleton */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between py-3 border-b">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </div>
  );
}

