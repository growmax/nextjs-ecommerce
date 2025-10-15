import { Suspense } from "react";
import type { Metadata } from "next";
import AddMoreProducts from "@/components/Global/Products/AddMoreProducts";
import CartItemCard from "./cart/components/CartItemCard/CartItemCard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Home | E-Commerce",
  description: "Browse and add products to your cart",
};

function AddMoreProductsSkeleton() {
  return (
    <div className="flex justify-end p-4">
      <Skeleton className="h-10 w-full max-w-md" />
    </div>
  );
}

function CartItemCardSkeleton() {
  return (
    <div className="p-4">
      <div className="p-4 border rounded-lg">
        <div className="flex gap-6">
          <Skeleton className="w-20 h-20 flex-shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-36 mt-2" />
            <Skeleton className="h-8 w-32 mt-3" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<AddMoreProductsSkeleton />}>
        <AddMoreProducts />
      </Suspense>
      <Suspense fallback={<CartItemCardSkeleton />}>
        <CartItemCard />
      </Suspense>
    </>
  );
}
