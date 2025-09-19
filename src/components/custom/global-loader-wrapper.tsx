"use client";

import { useLoading } from "@/contexts/LoadingContext";
import { GlobalLoader } from "./global-loader";

export function GlobalLoaderWrapper() {
  const { isLoading, message } = useLoading();

  return (
    <GlobalLoader
      visible={isLoading}
      {...(message && { message })}
      size="md"
      variant="primary"
      backdrop={true}
    />
  );
}
