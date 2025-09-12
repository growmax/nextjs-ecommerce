"use client";

import { usePathname } from "@/i18n/navigation";
import NavBar from "../app/Components/nav-bar";
import Footer from "../app/Components/footer";
import { UserDisplay } from "@/components/UserDisplay";

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
      {!hideNavAndFooter && <UserDisplay />}
      {children}
      {!hideNavAndFooter && <Footer />}
    </>
  );
}
