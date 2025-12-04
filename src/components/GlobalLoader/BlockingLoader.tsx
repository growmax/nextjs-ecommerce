"use client";

import { useBlockingLoader } from "@/providers/BlockingLoaderProvider";
import { useEffect, useState } from "react";

/**
 * BlockingLoader Component
 * 
 * Renders a blocking overlay with loading animation when active.
 * Features smooth scale animations and clean three-dot pattern.
 * 
 * Two modes:
 * - 'global': Fixed full-screen overlay (locks body scroll)
 * - 'scoped': Fixed viewport overlay (for page sections)
 * 
 * Features:
 * - Smooth scale + fade transitions (300ms)
 * - Clean semi-transparent overlay
 * - Theme-adaptive three-dot animation
 * - Elegant entrance/exit effects
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
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out pointer-events-auto"
      style={{
        opacity: isVisible ? 1 : 0,
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)',
      }}
    >
      <div 
        className="flex flex-col items-center gap-4 transition-all duration-300 ease-out"
        style={{
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
          opacity: isVisible ? 1 : 0,
        }}
      >
        {/* Three Dots Loader Card */}
        <div className="inline-flex items-center justify-center p-4 rounded-md shadow-sm bg-[var(--card)]">
          <svg
            width="120"
            height="40"
            viewBox="0 0 120 40"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Loading"
          >
            <circle cx="20" cy="20" r="12" fill="var(--primary-foreground)">
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="1.2s"
                repeatCount="indefinite"
                begin="0s"
              />
            </circle>
            <circle cx="60" cy="20" r="12" fill="var(--primary-foreground)">
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="1.2s"
                repeatCount="indefinite"
                begin="0.2s"
              />
            </circle>
            <circle cx="100" cy="20" r="12" fill="var(--primary-foreground)">
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="1.2s"
                repeatCount="indefinite"
                begin="0.4s"
              />
            </circle>
          </svg>
        </div>
      </div>
    </div>
  );
}

