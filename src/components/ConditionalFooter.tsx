"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Define paths where footer should be hidden
  const hideFooterPaths = ["/landing/quoteslanding", "/orders", "/cart"];

  // Check if current path matches any of the paths where footer should be hidden
  const shouldHideFooter = hideFooterPaths.some(path =>
    pathname.includes(path)
  );

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}
