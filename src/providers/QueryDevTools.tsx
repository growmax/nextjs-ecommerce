"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryDevTools() {
  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
  );
}
