import * as React from "react"

import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      suppressHydrationWarning
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}


// ✅ New SearchInput Component
export function SearchInput({
  placeholder = "Search...",
  onSearch,
  ...props
}: {
  placeholder?: string
  onSearch?: (value: string) => void
} & React.ComponentProps<"input">) {
  const [search, setSearch] = React.useState("")

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

      {/* Controlled Input */}
      <Input
        type="search"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          const value = e.target.value
          setSearch(value)
          if (onSearch) onSearch(value) // dynamically send value back
          // Current search value
        }}
        className="pl-10"
        {...props}
      />
    </div>
  )
}

export { Input }
