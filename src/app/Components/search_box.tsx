"use client";

import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <div className="p-6 space-y-4 w-2/6">
      <h1 className="text-xl font-bold">Search Demo</h1>

      {/* Simple Usage */}
      {/* <Input /> */}

      {/* With custom callback */}

      <Input
        placeholder="Search products..."
        onChange={_e => {
          // Handle search functionality here
        }}
      />
    </div>
  );
}
