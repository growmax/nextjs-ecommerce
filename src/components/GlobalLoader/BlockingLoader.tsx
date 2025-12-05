"use client";

import { useBlockingLoader } from "@/providers/BlockingLoaderProvider";
import { useEffect, useState } from "react";

/**
 * BlockingLoader Component
 *
 * Renders a blocking overlay with loading animation when active.
 * Features ultra-smooth three-dot animation with elastic easing.
 *
 * Two modes:
 * - 'global': Fixed full-screen overlay (locks body scroll)
 * - 'scoped': Fixed viewport overlay (for page sections)
 *
 * Features:
 * - Ultra-smooth bounce animation with elastic easing
 * - Perfectly timed three-dot cascade
 * - Minimal, elegant design
 * - Smooth fade + scale transitions
 */
export function BlockingLoader() {
  const { isActive, mode } = useBlockingLoader();
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle smooth enter/exit transitions with scale effect
  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Lock body scroll when in global mode and active
  useEffect(() => {
    if (mode === "global" && isActive) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [mode, isActive]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out pointer-events-auto backdrop-blur-sm"
      style={{
        opacity: isVisible ? 1 : 0,
        backgroundColor: isVisible
          ? "hsl(var(--background) / 0.6)"
          : "hsl(var(--background) / 0)",
      }}
    >
      {/* Smooth Three-Dot Bounce Animation */}
      <div
        className="transition-all duration-300 ease-out"
        style={{
          transform: isVisible ? "scale(1)" : "scale(0.9)",
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div className="flex items-center justify-center space-x-3">
          {[0, 1, 2].map(index => (
            <div
              key={index}
              className="rounded-full bg-primary/80"
              style={{
                width: "12px",
                height: "12px",
                animation: `bounce 1.4s ease-in-out infinite`,
                animationDelay: `${index * 0.16}s`,
              }}
            />
          ))}
        </div>
        <style jsx>{`
          @keyframes bounce {
            0%,
            60%,
            100% {
              transform: translateY(0);
              opacity: 0.8;
            }
            30% {
              transform: translateY(-12px);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
