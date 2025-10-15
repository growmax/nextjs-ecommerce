"use client";

import { Input } from "@/components/ui/input";

export default function SearchInput() {
  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Mobile-First Container */}
      <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-2xl">
        <h1 className="mb-4 text-lg font-bold sm:text-xl lg:text-2xl">
          Search Demo
        </h1>

        {/* Mobile-First Search Input */}
        <div className="w-full">
          <Input
            placeholder="Search products..."
            className="w-full min-h-[44px] text-base sm:text-sm"
            onChange={_e => {
              // Handle search functionality here
            }}
          />
        </div>
      </div>
    </div>
  );
}
