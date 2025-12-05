/**
 * Scroll lock utility for preventing page scroll when modals/sheets are open
 * Simplified approach to match buyer-fe behavior without padding compensation
 */

import * as React from "react";

let lockCount = 0;
let originalBodyOverflow = "";
let originalBodyPaddingRight = "";
let originalHtmlPaddingRight = "";

/**
 * Lock page scroll without causing layout shift
 */
export function lockScroll(): void {
  lockCount++;

  if (lockCount === 1) {
    // First lock - store original values and apply scroll lock
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;
    originalHtmlPaddingRight = document.documentElement.style.paddingRight;

    // Simply lock scroll without padding compensation to match buyer-fe
    // This prevents scrolling but may allow minor visual shift (as in buyer-fe)
    document.body.style.overflow = "hidden";
  }
}

/**
 * Unlock page scroll and restore original styles
 */
export function unlockScroll(): void {
  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    // Last unlock - restore original styles
    document.body.style.overflow = originalBodyOverflow || "";
    document.body.style.paddingRight = originalBodyPaddingRight || "";
    document.documentElement.style.paddingRight =
      originalHtmlPaddingRight || "";
  }
}

/**
 * React hook for scroll locking
 * Automatically locks scroll on mount and unlocks on unmount
 */
export function useScrollLock(isActive: boolean = true): void {
  React.useEffect(() => {
    if (!isActive) return;

    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isActive]);
}
