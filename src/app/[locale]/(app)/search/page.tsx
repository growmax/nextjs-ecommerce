import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search Products | E-Commerce",
  description: "Search for products in our catalog",
};

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
