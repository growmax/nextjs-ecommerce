"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { cn } from "@/lib/utils";

interface NavigationProgressProps {
  className?: string;
  height?: "sm" | "md" | "lg";
  color?: string;
  showSpinner?: boolean;
  zIndex?: number;
  autoDetect?: boolean;
}

/**
 * Navigation Progress Bar Component
 * 
 * Shows a subtle progress bar at the top of the screen during page navigation.
 * Designed to work seamlessly with Next.js App Router and existing loading states.
 */
export function NavigationProgress({
  className,
  height = "sm",
  color = "bg-primary",
  showSpinner = false,
  zIndex = 50,
  autoDetect = true,
}: NavigationProgressProps) {
  const pathname = usePathname();
  const { isLoading: globalLoading } = useLoading();
  
  // Use the navigation progress hook for automatic detection
  const { 
    isNavigating, 
    startNavigation, 
    endNavigation,
    loadingId 
  } = useNavigationProgress({ autoDetect });
  
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Handle mounting for SSR compatibility
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate progress when navigating
  useEffect(() => {
    if (mounted) {
      if (isNavigating || globalLoading) {
        setProgress(prev => {
          // Reset or start progress
          if (prev === 0) {
            return 10; // Start at 10% for immediate feedback
          }
          // Increment progress, but cap at 90% to avoid completing before navigation finishes
          const increment = Math.random() * 20;
          const newProgress = prev + increment;
          return newProgress >= 90 ? 90 : newProgress;
        });
      } else {
        // Complete the progress animation
        setProgress(100);
        setTimeout(() => {
          setProgress(0);
        }, 300);
      }
    }
  }, [isNavigating, globalLoading, mounted]);

  // Reset progress when pathname changes (navigation completed)
  useEffect(() => {
    if (mounted) {
      // Small delay to show completion
      const timer = setTimeout(() => {
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, mounted]);

  // Don't render anything on server or if not needed
  if (!mounted || (progress === 0 && !isNavigating && !globalLoading)) {
    return null;
  }

  const heightClasses = {
    sm: "h-0.5",
    md: "h-1", 
    lg: "h-2",
  };

  return (
    <>
      {/* Progress Bar */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-out",
          heightClasses[height],
          className
        )}
        style={{ zIndex }}
      >
        <div
          className={cn(
            "h-full transition-all duration-200 ease-out rounded-full",
            color
          )}
          style={{
            width: `${Math.max(progress, 5)}%`,
            minWidth: (isNavigating || globalLoading) ? "5%" : "0%",
          }}
        />
      </div>

      {/* Optional: Loading spinner when progress is nearly complete */}
      {showSpinner && (isNavigating || globalLoading) && progress > 70 && (
        <div
          className="fixed top-2 right-4 z-[60] animate-spin"
          style={{ zIndex }}
        >
          <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full" />
        </div>
      )}
    </>
  );
}

// Higher-order component to automatically wrap navigation with progress
export function withNavigationProgress<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function NavigationProgressWrapper(props: P) {
    const { isLoading } = useLoading();
    const [isNavigating, setIsNavigating] = useState(false);

    // This would be used in components that perform navigation
    const startNavigation = () => {
      setIsNavigating(true);
    };

    const endNavigation = () => {
      setIsNavigating(false);
    };

    return (
      <div className="relative">
        <WrappedComponent 
          {...props} 
          startNavigation={startNavigation}
          endNavigation={endNavigation}
          isNavigating={isNavigating}
        />
      </div>
    );
  };
}

// Hook for manual progress control
export function useNavigationProgressValue() {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startProgress = (initialProgress = 0) => {
    setIsActive(true);
    setProgress(initialProgress);
  };

  const setProgressValue = (value: number) => {
    setProgress(Math.max(0, Math.min(100, value)));
  };

  const completeProgress = () => {
    setProgress(100);
    setTimeout(() => {
      setIsActive(false);
      setProgress(0);
    }, 300);
  };

  const resetProgress = () => {
    setIsActive(false);
    setProgress(0);
  };

  return {
    progress,
    isActive,
    startProgress,
    setProgressValue,
    completeProgress,
    resetProgress,
  };
}
