import type { LayoutType } from "@/components/layout/PageContent";

/**
 * Auto-detect layout type based on pathname
 * This provides smart defaults that can be overridden by individual pages
 */
export function getAutoLayoutType(pathname: string): LayoutType {
  // Centered layouts for focused, text-heavy pages
  if (
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/documentation") ||
    pathname.startsWith("/help") ||
    pathname.startsWith("/support") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return "centered";
  }

  // Full-width layouts for visual, data-heavy pages
  if (
    pathname === "/" ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/gallery")
  ) {
    return "full-width";
  }

  // Default to auto for unknown routes
  return "auto";
}

/**
 * Get responsive padding classes based on layout type
 */
export function getLayoutPadding(layout: LayoutType): string {
  switch (layout) {
    case "full-width":
      return "px-0"; // No horizontal padding, components handle their own
    case "centered":
      return "px-4 sm:px-6 lg:px-8"; // Standard responsive padding
    case "auto":
    default:
      return "px-4 sm:px-6 lg:px-8";
  }
}

/**
 * Get layout-specific container classes
 */
export function getLayoutContainer(layout: LayoutType): string {
  switch (layout) {
    case "full-width":
      return "w-full min-h-screen";
    case "centered":
      return "max-w-6xl mx-auto min-h-screen";
    case "auto":
    default:
      return "max-w-7xl mx-auto min-h-screen";
  }
}
