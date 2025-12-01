"use client";

import { useEffect } from "react";

interface StructuredDataProps {
  data: Record<string, unknown>;
}

/**
 * StructuredData Component
 * Injects JSON-LD structured data for SEO
 */
export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Create script element
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    script.id = "structured-data";

    // Remove existing structured data if any
    const existing = document.getElementById("structured-data");
    if (existing) {
      existing.remove();
    }

    // Append to head
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const scriptToRemove = document.getElementById("structured-data");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
}

