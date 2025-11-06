import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search Products | E-Commerce",
  description: "Search for products in our catalog",
};

// Enable ISR for search page - revalidate every 30 minutes
// Search results can be cached but refreshed more frequently than homepage
export const revalidate = 1800; // 30 minutes

interface SearchPageProps {
  searchParams: {
    query?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.query || "";

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
          <SearchClient initialQuery={query} />

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
