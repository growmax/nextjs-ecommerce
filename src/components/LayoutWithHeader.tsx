"use client";

import { AppHeader } from "@/components/AppHeader/app-header";
import { PropsWithChildren, useState } from "react";

export default function LayoutWithHeader({ children }: PropsWithChildren) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <AppHeader open={isSearchOpen} setOpen={setIsSearchOpen} />
      <main
        className={`w-full overflow-x-hidden transition-all duration-150 ${
          isSearchOpen ? "blur-sm" : ""
        }`}
      >
        {children}
      </main>
    </>
  );
}
