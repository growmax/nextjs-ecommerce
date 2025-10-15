import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function CartSkeleton() {
  return (
    <div className="flex flex-start mt-6 px-8">
      <Card className="w-3/5 shadow-lg">
        <CardHeader className="text-lg font-semibold">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          {/* Seller Card Skeleton */}
          <div className="mb-4">
            <div className="p-2 border-2 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="p-4">
                  <Skeleton className="h-5 w-48" />
                </div>
                <div className="flex flex-col items-end p-4 gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Separator />

              <div>
                <div className="flex justify-between items-start">
                  <div className="p-4 flex gap-1">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="flex flex-col items-end p-4 gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Separator />
                <div className="p-4">
                  <Skeleton className="h-5 w-24 mb-4" />

                  {/* Product Item Skeletons */}
                  {[1, 2, 3].map(index => (
                    <div
                      key={index}
                      className="flex border p-4 justify-between items-start mb-2 rounded-md"
                    >
                      {/* Left Section */}
                      <div className="flex flex-col gap-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/3" />
                        <div className="flex items-center gap-2 mt-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-6 w-10 rounded" />
                          <Skeleton className="h-6 w-6 rounded" />
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-end gap-2">
                        <Skeleton className="h-6 w-6 rounded" />
                        <div className="flex flex-col gap-1 items-end mt-4">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
