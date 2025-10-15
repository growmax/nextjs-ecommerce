"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to prevent hydration mismatches
 * Returns true only after the component has mounted on the client
 */
export function useHydration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}