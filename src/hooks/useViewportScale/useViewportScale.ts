"use client";

import { useEffect, useState } from "react";

interface ViewportScaleOptions {
  maxScale?: number;
  minScale?: number;
  targetWidth?: number;
  targetHeight?: number;
  enabled?: boolean;
}

/**
 * Hook to calculate and apply viewport scaling to fit content within the visible area
 * @param options - Configuration options for scaling behavior
 * @returns Current scale value
 */
export function useViewportScale(options: ViewportScaleOptions = {}) {
  const {
    maxScale = 1,
    minScale = 0.5,
    targetWidth,
    targetHeight,
    enabled = true,
  } = options;

  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!enabled) {
      setScale(1);
      return;
    }

    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let calculatedScale = 1;

      if (targetWidth && targetHeight) {
        // Scale based on both dimensions
        const scaleX = viewportWidth / targetWidth;
        const scaleY = viewportHeight / targetHeight;
        calculatedScale = Math.min(scaleX, scaleY);
      } else if (targetWidth) {
        // Scale based on width only
        calculatedScale = viewportWidth / targetWidth;
      } else if (targetHeight) {
        // Scale based on height only
        calculatedScale = viewportHeight / targetHeight;
      } else {
        // Auto-detect based on content
        const contentElement = document.body;
        if (contentElement) {
          const contentWidth = contentElement.scrollWidth;
          const contentHeight = contentElement.scrollHeight;

          if (contentWidth > viewportWidth || contentHeight > viewportHeight) {
            const scaleX = viewportWidth / contentWidth;
            const scaleY = viewportHeight / contentHeight;
            calculatedScale = Math.min(scaleX, scaleY);
          }
        }
      }

      // Apply min/max constraints
      calculatedScale = Math.max(minScale, Math.min(maxScale, calculatedScale));
      setScale(calculatedScale);
    };

    // Initial calculation
    calculateScale();

    // Recalculate on resize with debounce
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateScale, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [enabled, targetWidth, targetHeight, minScale, maxScale]);

  return scale;
}
