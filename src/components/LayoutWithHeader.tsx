"use client";

import { AppHeader } from "@/components/AppHeader/app-header";
import { MainContentLoader } from "@/components/custom/MainContentLoader";
import { PageContent } from "@/components/layout/PageContent";
import { PropsWithChildren, useState } from "react";

export default function LayoutWithHeader({ children }: PropsWithChildren) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <AppHeader open={isSearchOpen} setOpen={setIsSearchOpen} />
      <main
        className={`relative w-full overflow-x-hidden transition-all duration-150 mt-14 sm:mt-16 ${
          isSearchOpen ? "blur-sm" : ""
        }`}
      >
        <MainContentLoader />
        <PageContent layout="full-width">
          {children}
        </PageContent>
      </main>
    </>
  );
}
