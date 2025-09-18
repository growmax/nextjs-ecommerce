"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface GlobalLoaderProps {
  visible: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  backdrop?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export function GlobalLoader({
  visible,
  message,
  size = "md",
  backdrop = true,
}: GlobalLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (visible) {
      // Prevent scrolling when loader is visible
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [visible]);

  if (!mounted || !visible) return null;

  const loaderContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "transition-all duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
      aria-label={message || "Loading"}
    >
      {/* Backdrop */}
      {backdrop && (
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Loader Content */}
      <div className="relative flex flex-col items-center gap-4 p-6">
        {/* Spinner */}
        <div
          className={cn("relative", sizeClasses[size], "animate-spin")}
          role="status"
          aria-label="Loading spinner"
        >
          {/* Multi-spoke spinner similar to the screenshot */}
          <svg
            className="w-full h-full text-primary"
            viewBox="0 0 24 24"
            fill="none"
          >
            {/* Create 8 spokes for the spinner */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1="12"
                y1="2"
                x2="12"
                y2="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${i * 45} 12 12)`}
                opacity={0.2 + i * 0.1}
              />
            ))}
          </svg>
        </div>

        {/* Loading Message */}
        {message && (
          <div className="text-sm font-medium text-foreground">{message}</div>
        )}
      </div>
    </div>
  );

  // Render using portal to ensure it's on top of everything
  return createPortal(loaderContent, document.body);
}

// Optional: Pre-built loader variants for common use cases
export function LogoutLoader({ visible }: { visible: boolean }) {
  return (
    <GlobalLoader
      visible={visible}
      message="Logging out..."
      size="md"
      variant="primary"
    />
  );
}

export function ProcessingLoader({
  visible,
  message,
}: {
  visible: boolean;
  message?: string;
}) {
  return (
    <GlobalLoader
      visible={visible}
      message={message || "Processing..."}
      size="md"
      variant="primary"
    />
  );
}

export function SubmittingLoader({ visible }: { visible: boolean }) {
  return (
    <GlobalLoader
      visible={visible}
      message="Submitting..."
      size="md"
      variant="primary"
    />
  );
}
