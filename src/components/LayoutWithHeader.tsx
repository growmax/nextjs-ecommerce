"use client";

import { AppHeader } from "@/components/AppHeader/app-header";
import { MainContentLoader } from "@/components/custom/MainContentLoader";
import { PageContent } from "@/components/layout/PageContent";
import { PropsWithChildren } from "react";

export default function LayoutWithHeader({ children }: PropsWithChildren) {
  return (
    <>
      <AppHeader />
      <main
        className="relative w-full overflow-x-hidden transition-all duration-150 mt-14 sm:mt-16"
      >
        <MainContentLoader />
        <PageContent layout="full-width">
          {children}
        </PageContent>
      </main>
    </>
  );
}
