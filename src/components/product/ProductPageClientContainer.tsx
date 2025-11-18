"use client";

import React, { useEffect, useRef } from "react";

interface ProductPageClientContainerProps {
  product: any; // Using any for now
  elasticIndex: string;
  context: {
    origin: string;
    tenantCode: string;
  };
  baseImages: any[]; // Using any for now
  children: React.ReactNode;
}

export default function ProductPageClientContainer({
  children,
}: ProductPageClientContainerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (event: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if (event.deltaY > 0 && isAtBottom) {
        window.scrollBy(0, event.deltaY);
        event.preventDefault();
      } else if (event.deltaY < 0 && isAtTop) {
        window.scrollBy(0, event.deltaY);
        event.preventDefault();
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, [scrollContainerRef]);

  return (
    <div
      ref={scrollContainerRef}
      className="space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-theme(space.8)*2)] scrollbar-hide"
    >
      {children}
    </div>
  );
}
