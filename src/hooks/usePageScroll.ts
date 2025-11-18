import { useEffect } from "react";

/**
 * Hook to enable vertical page scrolling while preventing horizontal scrolling.
 *
 * This is useful for pages that need to scroll vertically (like detail pages)
 * when the global CSS sets body/html to overflow: hidden.
 *
 * The hook automatically restores the original styles when the component unmounts.
 */
export function usePageScroll() {
  useEffect(() => {
    // Store original styles to restore them later
    const originalBodyOverflowY = document.body.style.overflowY;
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalHtmlOverflowY = document.documentElement.style.overflowY;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlHeight = document.documentElement.style.height;

    // Enable vertical page scrolling, prevent horizontal scrolling
    document.body.style.overflowY = "auto";
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowY = "auto";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.height = "auto";
    document.documentElement.style.height = "auto";

    // Cleanup: restore original styles when leaving the page
    return () => {
      // Restore body styles
      if (originalBodyOverflow) {
        document.body.style.overflow = originalBodyOverflow;
      } else {
        document.body.style.overflowY = originalBodyOverflowY || "";
        document.body.style.overflowX = originalBodyOverflowX || "";
      }
      document.body.style.height = originalBodyHeight || "";

      // Restore html styles
      if (originalHtmlOverflow) {
        document.documentElement.style.overflow = originalHtmlOverflow;
      } else {
        document.documentElement.style.overflowY = originalHtmlOverflowY || "";
        document.documentElement.style.overflowX = originalHtmlOverflowX || "";
      }
      document.documentElement.style.height = originalHtmlHeight || "";
    };
  }, []);
}
