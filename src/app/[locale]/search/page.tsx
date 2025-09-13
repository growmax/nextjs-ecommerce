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
      <Card className="container mx-auto px-4 py-8">
        <CardContent>
          <CardTitle className="text-2xl font-bold">Search</CardTitle>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="container mx-auto px-4 py-8">
      <CardContent>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Card className="flex-1 relative border-0 p-0">
                <CardContent className="p-0 relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </form>
          </CardContent>
        </Card>

        {query ? (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Showing results for:{" "}
                <span className="font-semibold">&quot;{query}&quot;</span>
              </p>
              <Card className="text-center py-8 border-0">
                <CardContent>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <CardTitle className="text-muted-foreground font-normal text-base">
                    No results found
                  </CardTitle>
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Try searching for something else
                  </CardTitle>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Enter a search term to get started
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
