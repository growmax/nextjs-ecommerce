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
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

/**
 * Error boundary for product detail page
 * Handles errors gracefully with user-friendly messaging
 */
export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { prefetch } = useRoutePrefetch();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            We encountered an error while loading this product page. This could
            be due to:
          </p>

          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>The product may no longer be available</li>
            <li>There might be a temporary connection issue</li>
            <li>The product ID in the URL might be invalid</li>
          </ul>

          {error.message && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground font-mono">
                Error: {error.message}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button onClick={reset} variant="default" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

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
