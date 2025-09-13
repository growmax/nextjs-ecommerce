"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const t = useTranslations();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length === 0) {
      return; // Don't search for empty queries
    }

    if (trimmedQuery.length < 2) {
      return; // Minimum 2 characters for search
    }

    router.push(`/search?query=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
      <Input
        type="text"
        placeholder={t("search.placeholder")}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="pr-10"
        aria-label={t("search.button")}
      />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
