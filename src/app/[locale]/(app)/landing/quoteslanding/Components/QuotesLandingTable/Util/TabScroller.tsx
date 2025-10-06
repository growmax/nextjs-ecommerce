"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TabScrollerProps {
  children: React.ReactNode;
}

export function TabScroller({ children }: TabScrollerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    // Initial check after images and content load
    const observer = new ResizeObserver(checkScroll);
    observer.observe(container);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      observer.disconnect();
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative flex items-center w-full">
      {/* Left scroll button */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-30 flex items-center justify-center w-8 h-full bg-gradient-to-r from-white via-white to-transparent
            hover:w-10 transition-all duration-300 ease-out group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-700 group-hover:scale-110 transition-all duration-300" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center min-w-0">{children}</div>
      </div>

      {/* Right scroll button */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-30 flex items-center justify-center w-8 h-full bg-gradient-to-l from-white via-white to-transparent
            hover:w-10 transition-all duration-300 ease-out group"
        >
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-700 group-hover:scale-110 transition-all duration-300" />
        </button>
      )}
    </div>
  );
}
