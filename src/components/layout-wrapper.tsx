"use client";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import Footer from "./footer";
import NavBar from "./nav-bar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  const hideNavAndFooter = pathname === "/login" || pathname === "/register";
  const hideFooterOnly = pathname.startsWith("/settings");

  return (
    <>
      {!hideNavAndFooter && <NavBar />}
      <main
        className={cn(
          "min-h-screen",
          !hideNavAndFooter && "pt-4",
          !(hideNavAndFooter || hideFooterOnly) && "pb-8"
        )}
      >
        {children}
      </main>
      {!hideNavAndFooter && !hideFooterOnly && <Footer />}
    </>
  );
}
