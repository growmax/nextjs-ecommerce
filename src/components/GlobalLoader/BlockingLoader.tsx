"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
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
 * - 'scoped': Fixed content area overlay (between sidebar and header, no scroll lock)
 * 
 * Features:
 * - Ultra-smooth bounce animation with elastic easing
 * - Perfectly timed three-dot cascade
 * - Minimal, elegant design
 * - Smooth fade + scale transitions
 * - Responsive sidebar positioning
 */
export function BlockingLoader() {
  const { isActive, mode } = useBlockingLoader();
  const { state: sidebarState } = useSidebar();
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isSidebarCollapsed = sidebarState === "collapsed";

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

  // Lock body scroll only when in global mode and active
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
      className={cn(
        "z-50 flex items-center justify-center transition-all duration-300 ease-out",
        mode === "global" 
          ? "fixed inset-0" // Full screen for global mode with fixed positioning
          : cn(
              // Content area mode: position within the main content area using fixed positioning
              "fixed right-0",
              // Position below header (same as MainContentLoader)
              "top-[calc(3.5rem+1px)] sm:top-[calc(4rem+1px)]",
              "bottom-0",
              // Mobile: Full width (sidebar is overlay)
              "left-0",
              // Desktop: Adjust for sidebar
              "md:left-[var(--sidebar-width-icon)]",
              !isSidebarCollapsed && "md:left-[var(--sidebar-width)]"
            )
      )}
      style={{
        opacity: isVisible ? 1 : 0,
        // backdropFilter: "contrast(0%)",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
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
              className="rounded-full bg-primary shadow-lg"
              style={{
                width: "14px",
                height: "14px",
                animation: `bounce 1.4s ease-in-out infinite`,
                animationDelay: `${index * 0.16}s`,
                opacity: 1,
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
