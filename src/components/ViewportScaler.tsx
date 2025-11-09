"use client";

import { useViewportScale } from "@/hooks/useViewportScale";
import { ReactNode } from "react";

interface ViewportScalerProps {
  children: ReactNode;
  maxScale?: number;
  minScale?: number;
  targetWidth?: number;
  targetHeight?: number;
  enabled?: boolean;
  className?: string;
  /**
   * If true, adjusts content to fit within viewport dynamically
   * If false, uses CSS container queries for responsive scaling
   */
  dynamicScale?: boolean;
}

/**
 * Component that wraps content and scales it to fit within the viewport
 * Provides both dynamic JavaScript-based scaling and CSS-based responsive scaling
 */
export function ViewportScaler({
  children,
  maxScale = 1,
  minScale = 0.6,
  targetWidth,
  targetHeight,
  enabled = true,
  className = "",
  dynamicScale = false,
}: ViewportScalerProps) {
  const scale = useViewportScale({
    maxScale,
    minScale,
    ...(targetWidth !== undefined && { targetWidth }),
    ...(targetHeight !== undefined && { targetHeight }),
    enabled: enabled && dynamicScale,
  });

  if (dynamicScale) {
    return (
      <div
        className={`viewport-scaler ${className}`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    );
  }

  // Use CSS-based responsive scaling
  return (
    <div
      className={`viewport-scaler-responsive ${className}`}
      style={{
        width: "100%",
        height: "100%",
        containerType: "size",
      }}
    >
      {children}
    </div>
  );
}
