"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const query = searchParams.get("query") || "";

  useEffect(() => {
    setMounted(true);
    setSearchQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <CardTitle>Search</CardTitle>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pr-12"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {query ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Showing results for:{" "}
                <span className="font-semibold">&quot;{query}&quot;</span>
              </p>
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-muted-foreground mb-2">
                  No results found
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Try searching for something else
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-muted-foreground mb-2">
                Start searching
              </CardTitle>
              <p className="text-muted-foreground">
                Enter a search term to find products
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
