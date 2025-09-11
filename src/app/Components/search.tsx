"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSafeTranslation } from "@/hooks/use-safe-translation";

export default function SearchBox() {
  const { t } = useSafeTranslation();

  return (
    <div className="relative flex-1 max-w-xl">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        type="text"
        placeholder={t("search.placeholder", "Search...")}
        className="pl-10"
        aria-label={t("search.button", "Search")}
      />
    </div>
  );
}
