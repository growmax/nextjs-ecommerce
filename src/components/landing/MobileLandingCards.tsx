"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileLandingCardsProps<T> {
  items: T[];
  loading: boolean;
  renderCard: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  skeletonCount?: number;
  className?: string;
}

export function MobileLandingCards<T>({
  items,
  loading,
  renderCard,
  emptyMessage = "No items found",
  skeletonCount = 5,
  className,
}: MobileLandingCardsProps<T>) {
  if (loading) {
    return (
      <div className={cn("space-y-1.5 px-1 py-1", className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <CardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-8 px-4", className)}>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5 px-1 py-1", className)}>
      {items.map((item, index) => (
        <div key={index}>{renderCard(item, index)}</div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="border rounded-lg p-4 bg-card shadow-sm">
      <div className="flex flex-col gap-2  justify-between">
       
        <Skeleton className="h-4 w-70 "/>
        <Skeleton className="h-4 w-70" />
        <Skeleton className="h-4 w-70" />
        <Skeleton className="h-4 w-70" />
      </div>
     
    </div>
  );
}

