"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  defaultOpen?: boolean;
}>;

export function SidebarProviderWrapper({
  defaultOpen = true,
  children,
}: Props) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
  );
}
