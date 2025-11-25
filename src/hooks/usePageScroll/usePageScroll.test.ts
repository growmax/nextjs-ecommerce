import { renderHook } from "@testing-library/react";
import { usePageScroll } from "@/hooks/usePageScroll/usePageScroll";

describe("usePageScroll", () => {
  let originalBodyOverflow: string;
  let originalBodyOverflowY: string;
  let originalBodyOverflowX: string;
  let originalBodyHeight: string;
  let originalHtmlOverflow: string;
  let originalHtmlOverflowY: string;
  let originalHtmlOverflowX: string;
  let originalHtmlHeight: string;

  beforeEach(() => {
    // Store original values
    originalBodyOverflow = document.body.style.overflow;
    originalBodyOverflowY = document.body.style.overflowY;
    originalBodyOverflowX = document.body.style.overflowX;
    originalBodyHeight = document.body.style.height;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalHtmlOverflowY = document.documentElement.style.overflowY;
    originalHtmlOverflowX = document.documentElement.style.overflowX;
    originalHtmlHeight = document.documentElement.style.height;

    // Reset styles
    document.body.style.overflow = "";
    document.body.style.overflowY = "";
    document.body.style.overflowX = "";
    document.body.style.height = "";
    document.documentElement.style.overflow = "";
    document.documentElement.style.overflowY = "";
    document.documentElement.style.overflowX = "";
    document.documentElement.style.height = "";
  });

  afterEach(() => {
    // Restore original values
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.overflowY = originalBodyOverflowY;
    document.body.style.overflowX = originalBodyOverflowX;
    document.body.style.height = originalBodyHeight;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.documentElement.style.overflowY = originalHtmlOverflowY;
    document.documentElement.style.overflowX = originalHtmlOverflowX;
    document.documentElement.style.height = originalHtmlHeight;
  });

  it("should enable vertical scrolling and prevent horizontal scrolling on mount", () => {
    const { unmount } = renderHook(() => usePageScroll());

    // Check that styles are set correctly
    expect(document.body.style.overflowY).toBe("auto");
    expect(document.body.style.overflowX).toBe("hidden");
    expect(document.body.style.height).toBe("auto");
    expect(document.documentElement.style.overflowY).toBe("auto");
    expect(document.documentElement.style.overflowX).toBe("hidden");
    expect(document.documentElement.style.height).toBe("auto");

    unmount();
  });

  it("should restore original styles on unmount when no original styles exist", () => {
    const { unmount } = renderHook(() => usePageScroll());

    // Verify styles are set
    expect(document.body.style.overflowY).toBe("auto");

    // Unmount should restore empty strings
    unmount();

    expect(document.body.style.overflowY).toBe("");
    expect(document.body.style.overflowX).toBe("");
    expect(document.body.style.height).toBe("");
    expect(document.documentElement.style.overflowY).toBe("");
    expect(document.documentElement.style.overflowX).toBe("");
    expect(document.documentElement.style.height).toBe("");
  });

  it("should restore original styles on unmount when original styles exist", () => {
    // Set initial styles
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100vh";

    const { unmount } = renderHook(() => usePageScroll());

    // Verify styles are changed
    expect(document.body.style.overflowY).toBe("auto");
    expect(document.body.style.height).toBe("auto");

    // Unmount should restore original styles
    unmount();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.height).toBe("100vh");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.documentElement.style.height).toBe("100vh");
  });

  it("should handle separate overflowY and overflowX properties", () => {
    // Set initial separate properties
    document.body.style.overflowY = "scroll";
    document.body.style.overflowX = "scroll";
    document.documentElement.style.overflowY = "scroll";
    document.documentElement.style.overflowX = "scroll";

    const { unmount } = renderHook(() => usePageScroll());

    // Verify styles are changed
    expect(document.body.style.overflowY).toBe("auto");
    expect(document.body.style.overflowX).toBe("hidden");

    // Unmount should restore original separate properties
    unmount();

    expect(document.body.style.overflowY).toBe("scroll");
    expect(document.body.style.overflowX).toBe("scroll");
    expect(document.documentElement.style.overflowY).toBe("scroll");
    expect(document.documentElement.style.overflowX).toBe("scroll");
  });
});
