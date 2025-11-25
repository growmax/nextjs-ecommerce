"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch/useRoutePrefetch";
import { Home, PackageX, Search } from "lucide-react";
import Link from "next/link";

/**
 * Not Found page for product detail
 * Displayed when a product ID doesn't exist
 */
export default function ProductNotFound() {
  const { prefetch } = useRoutePrefetch();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <PackageX className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Product Not Found</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Sorry, we couldn't find the product you're looking for.
          </p>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              The product may have been:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground ml-2">
              <li>Removed from our catalog</li>
              <li>Discontinued by the manufacturer</li>
              <li>Moved to a different URL</li>
            </ul>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Try searching for similar products or browse our categories.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/search"
            className="flex-1"
            onMouseEnter={() => prefetch("/search")}
          >
            <Button variant="default" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Search Products
            </Button>
          </Link>

          <Link href="/" className="flex-1" onMouseEnter={() => prefetch("/")}>
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
