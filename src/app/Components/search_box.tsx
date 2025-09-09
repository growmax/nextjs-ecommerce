"use client"

import { SearchInput } from "@/components/ui/input"

export default function Page() {
  return (
    <div className="p-6 space-y-4 w-2/6">
      <h1 className="text-xl font-bold">Search Demo</h1>

      {/* Simple Usage */}
      {/* <SearchInput /> */}

      {/* With custom callback */}
      <SearchInput
        placeholder="Search products..."
        onSearch={() => {
          // Search triggered
        }}
      />
    </div>
  )
}
