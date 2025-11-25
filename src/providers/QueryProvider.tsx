"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time: Data is considered fresh for 5 minutes
            // Individual queries can override this with query-specific stale times
            staleTime: 5 * 60 * 1000,
            // Garbage collection time: Data is removed from cache after 10 minutes
            gcTime: 10 * 60 * 1000,
            // Prevent duplicate calls on mount - use cached data if available
            refetchOnMount: false,
            // Don't refetch on window focus to prevent duplicate calls
            refetchOnWindowFocus: false,
            // Retry configuration
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (client errors)
              if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                if (
                  errorMessage.includes("401") ||
                  errorMessage.includes("403") ||
                  errorMessage.includes("404")
                ) {
                  return false;
                }
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            // Retry delay: exponential backoff
            retryDelay: attemptIndex =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
