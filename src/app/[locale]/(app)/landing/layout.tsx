import { LandingLayout } from "@/components/layout";
import React from "react";

export default function LandingLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandingLayout>{children}</LandingLayout>;
}
