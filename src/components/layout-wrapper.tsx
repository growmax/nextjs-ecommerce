"use client";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import NavBar from "./nav-bar";
import Footer from "./footer";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Hide navbar and footer on auth pages
  const hideNavAndFooter = pathname === "/login" || pathname === "/register";

  return (
    <>
      {!hideNavAndFooter && <NavBar />}
      <main className={cn("min-h-screen", !hideNavAndFooter && "pt-4 pb-8")}>
        {children}
      </main>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}
