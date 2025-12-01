"use client";

import { useLoading } from "@/hooks/useGlobalLoader";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TopProgressBarProps {
  /**
   * Height of the progress bar in pixels
   * @default 3
   */
  height?: number;

  /**
   * Color of the progress bar
   * @default "bg-primary"
   */
  color?: string;

  /**
   * Whether to show a subtle shadow
   * @default true
   */
  showShadow?: boolean;

  /**
   * Animation duration in milliseconds
   * @default 300
   */
  animationDuration?: number;

  /**
   * Z-index for the progress bar
   * @default 9999
   */
  zIndex?: number;
}

/**
 * TopProgressBar - A thin progress bar that appears at the top of the page
 * during loading states (navigation, API calls, etc.)
 *
 * This component automatically integrates with the global loading context
 * and shows/hides based on loading state.
 */
export function TopProgressBar({
  height = 3,
  color = "bg-primary",
  showShadow = true,
  zIndex = 9999,
  animationDuration = 300,
}: TopProgressBarProps) {
  const { isLoading } = useLoading();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Start showing the progress bar
      setIsVisible(true);
      setProgress(0);

      // Simulate progress animation with smoother increments
      let currentProgress = 0;
      const interval = setInterval(() => {
        if (currentProgress < 90) {
          // Gradually increase progress, but cap at 90% until loading completes
          // Use smaller increments for smoother animation
          currentProgress += Math.min(Math.random() * 10, 90 - currentProgress);
          setProgress(currentProgress);
        }
      }, 150);

      return () => {
        clearInterval(interval);
      };
    } else if (isVisible) {
      // Only complete if we were visible
      // Complete the progress bar
      setProgress(100);

      // Hide after animation completes
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, animationDuration);

      return () => {
        clearTimeout(timeout);
      };
    }
    // Return undefined for the case when isLoading is false and isVisible is false
    return undefined;
  }, [isLoading, animationDuration, isVisible]);

  if (!isVisible && progress === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{
        zIndex,
        height: `${height}px`,
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading progress"
    >
      <div
        className={cn(
          "h-full transition-all duration-200 ease-out",
          color,
          showShadow && "shadow-sm"
        )}
        style={{
          width: `${progress}%`,
          transition: `width ${animationDuration}ms ease-out`,
        }}
      />
    </div>
  );
}
