"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Link } from "@/i18n/navigation";
import { FolderX, Grid3x3, Home, Search } from "lucide-react";

interface CategoryNotFoundProps {
  attemptedSlugs: string[];
  locale?: string;
}

/**
 * Not Found page for category pages
 * Displayed when a category slug doesn't exist
 */
export default function CategoryNotFound({
  attemptedSlugs,
  locale: _locale = "en",
}: CategoryNotFoundProps) {
  const attemptedCategory = attemptedSlugs[attemptedSlugs.length - 1] || "category";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FolderX className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Category Not Found</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Sorry, we couldn't find the category{" "}
            <span className="font-semibold text-foreground">
              &quot;{attemptedCategory}&quot;
            </span>
            .
          </p>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              The category may have been:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground ml-2">
              <li>Removed or renamed</li>
              <li>Moved to a different URL</li>
              <li>Not available in your region</li>
            </ul>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Try browsing all categories or search for products instead.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Link href="/categories/All" prefetch={true} className="flex-1">
            <Button variant="default" className="w-full">
              <Grid3x3 className="mr-2 h-4 w-4" />
              Browse Categories
            </Button>
          </Link>

          <Link href="/search" prefetch={true} className="flex-1">
            <Button variant="outline" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Search Products
            </Button>
          </Link>

          <Link href="/" prefetch={true} className="flex-1">
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

